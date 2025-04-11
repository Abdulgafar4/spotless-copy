import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  status: "paid" | "pending" | "refunded" | "failed";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  method_id?: string;
  date: string;
  created_at: string;
  invoice_url?: string;
}

interface PaymentMethod {
  id: string;
  user_id: string;
  type: "credit_card" | "debit_card" | "paypal" | "bank_account";
  details: {
    last4?: string;
    brand?: string;
    expiry?: string;
    name?: string;
    email?: string;
    bank_name?: string;
  };
  is_default: boolean;
  created_at: string;
  stripe_payment_method_id?: string;
}

interface PaymentRequest {
  booking_id: string;
  amount: number;
  payment_method_id?: string;
  method?: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  return_url: string;
}

interface UsePaymentsReturn {
  payments: Payment[];
  pendingPayments: Payment[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: Error | null;
  fetchPayments: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  createPaymentSession: (request: PaymentRequest) => Promise<{ sessionId: string; url: string } | null>;
  processPaymentWithSavedMethod: (request: PaymentRequest) => Promise<boolean>;
  addPaymentMethod: (paymentMethodData: Omit<PaymentMethod, "id" | "user_id" | "is_default" | "created_at">) => Promise<PaymentMethod>;
  setDefaultPaymentMethod: (id: string) => Promise<boolean>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
}

export const usePayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setError(new Error("Unauthorized: User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("payments")
        .select(`
          *,
          booking:bookings(id, service_type, date)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      // Separate pending from completed payments
      const pending: Payment[] = [];
      const completed: Payment[] = [];
      
      data?.forEach(payment => {
        if (payment.status === "pending") {
          pending.push(payment);
        } else {
          completed.push(payment);
        }
      });

      setPayments(completed || []);
      setPendingPayments(pending || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) {
      setError(new Error("Unauthorized: User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setPaymentMethods(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      console.error("Failed to fetch payment methods:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createPaymentSession = useCallback(async (request: PaymentRequest): Promise<{ sessionId: string; url: string } | null> => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return null;
    }

    try {
      setLoading(true);
      
      // Create a payment intent via our API
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: request.booking_id,
          amount: request.amount,
          return_url: request.return_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment session");
      }

      const data = await response.json();
      return {
        sessionId: data.sessionId,
        url: data.url
      };
    } catch (err) {
      console.error("Error creating payment session:", err);
      toast.error("Unable to initialize payment");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const processPaymentWithSavedMethod = useCallback(async (request: PaymentRequest): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return false;
    }

    if (!request.payment_method_id) {
      toast.error("No payment method selected");
      return false;
    }

    try {
      setLoading(true);
      
      // Process payment with saved method via our API
      const response = await fetch('/api/process-saved-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: request.booking_id,
          payment_method_id: request.payment_method_id,
          amount: request.amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment processing failed");
      }

      const { success, message } = await response.json();
      
      if (success) {
        toast.success("Payment processed successfully!");
        await fetchPayments(); // Refresh payment data
        return true;
      } else {
        throw new Error(message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      toast.error(err instanceof Error ? err.message : "Unable to process payment");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchPayments]);

  const addPaymentMethod = useCallback(async (
    paymentMethodData: Omit<PaymentMethod, "id" | "user_id" | "is_default" | "created_at">
  ): Promise<PaymentMethod> => {
    if (!user) {
      throw new Error("You must be logged in to add a payment method");
    }

    try {
      setLoading(true);
      
      // Determine if this should be the default
      const isDefault = paymentMethods.length === 0;
      
      // Create payment method in database
      const { data, error: insertError } = await supabase
        .from("payment_methods")
        .insert([
          {
            user_id: user.id,
            type: paymentMethodData.type,
            details: paymentMethodData.details,
            is_default: isDefault,
            stripe_payment_method_id: paymentMethodData.stripe_payment_method_id
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to create payment method: No data returned");
      }

      const newPaymentMethod = data[0] as PaymentMethod;
      
      // Update local state
      setPaymentMethods(prevMethods => [...prevMethods, newPaymentMethod]);
      
      toast.success("Payment method added successfully");
      return newPaymentMethod;
    } catch (err) {
      console.error("Error adding payment method:", err);
      toast.error("Failed to add payment method");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, paymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      throw new Error("You must be logged in to change payment methods");
    }

    try {
      setLoading(true);
      
      // First, set all payment methods to non-default
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", user.id);
      
      // Then set the selected one as default
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setPaymentMethods(prevMethods =>
        prevMethods.map(method => ({
          ...method,
          is_default: method.id === id
        }))
      );
      
      toast.success("Default payment method updated");
      return true;
    } catch (err) {
      console.error("Error setting default payment method:", err);
      toast.error("Failed to update default payment method");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      throw new Error("You must be logged in to delete payment methods");
    }

    try {
      setLoading(true);
      
      // Check if it's the default method
      const methodToDelete = paymentMethods.find(method => method.id === id);
      
      // Delete the payment method
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedMethods);
      
      // If we deleted the default method and others exist, set a new default
      if (methodToDelete?.is_default && updatedMethods.length > 0) {
        await setDefaultPaymentMethod(updatedMethods[0].id);
      }
      
      toast.success("Payment method deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting payment method:", err);
      toast.error("Failed to delete payment method");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, paymentMethods, setDefaultPaymentMethod]);

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      Promise.all([
        fetchPayments(),
        fetchPaymentMethods()
      ]);
    }
  }, [user, fetchPayments, fetchPaymentMethods]);

  return {
    payments,
    pendingPayments,
    paymentMethods,
    loading,
    error,
    fetchPayments,
    fetchPaymentMethods,
    createPaymentSession,
    processPaymentWithSavedMethod,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod
  };
};