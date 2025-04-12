// hooks/use-client-payments.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: "paid" | "pending" | "refunded" | "failed";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  date: string;
  created_at: string;
  invoice_url?: string;
  booking?: {
    id: string;
    service_type: string;
    date: string;
  };
}

export interface PaymentMethod {
  id: string;
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
}

interface UseClientPaymentsReturn {
  payments: Payment[];
  pendingPayments: Payment[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: Error | null;
  fetchPayments: () => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  makePayment: (paymentId: string, methodId: string) => Promise<boolean>;
  addPaymentMethod: (paymentMethodData: Omit<PaymentMethod, "id" | "is_default">) => Promise<PaymentMethod>;
  setDefaultPaymentMethod: (id: string) => Promise<boolean>;
  deletePaymentMethod: (id: string) => Promise<boolean>;
  downloadInvoice: (paymentId: string) => Promise<string | null>;
}

export const useClientPayments = (): UseClientPaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch payments from Supabase
  const fetchPayments = useCallback(async () => {
    if (!user) {
      setError(new Error("User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from("payments")
        .select(`
          *,
          booking:bookings(id, service_type, date)
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        throw fetchError;
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
      console.error("Error fetching payments:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch payments"));
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch payment methods from Supabase
  const fetchPaymentMethods = useCallback(async () => {
    if (!user) {
      setError(new Error("User not authenticated"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch payment methods"));
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Process a payment
  const makePayment = useCallback(async (paymentId: string, methodId: string): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return false;
    }

    try {
      setLoading(true);
      
      // Verify payment belongs to user
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .eq("user_id", user.id)
        .single();
      
      if (paymentError) {
        throw paymentError;
      }
      
      if (!paymentData) {
        throw new Error("Payment not found");
      }
      
      // Verify payment method belongs to user
      const { data: methodData, error: methodError } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("id", methodId)
        .eq("user_id", user.id)
        .single();
      
      if (methodError) {
        throw methodError;
      }
      
      if (!methodData) {
        throw new Error("Payment method not found");
      }
      
      // Process payment via API
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          method_id: methodId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Payment processing failed");
      }

      // Update payment status in database
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "paid",
          method: methodData.type,
          method_id: methodId,
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentId)
        .eq("user_id", user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Payment processed successfully!");
      await fetchPayments();
      return true;
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error(err instanceof Error ? err.message : "Failed to process payment");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, fetchPayments]);

  // Add a payment method
  const addPaymentMethod = useCallback(async (
    paymentMethodData: Omit<PaymentMethod, "id" | "is_default">
  ): Promise<PaymentMethod> => {
    if (!user) {
      throw new Error("You must be logged in to add a payment method");
    }

    try {
      setLoading(true);
      
      // Check if this should be the default method (if no methods exist)
      const { data: existingMethods, error: checkError } = await supabase
        .from("payment_methods")
        .select("id")
        .eq("user_id", user.id);
      
      if (checkError) {
        throw checkError;
      }
      
      const isDefault = !existingMethods || existingMethods.length === 0;
      
      // Insert the new payment method
      const { data, error: insertError } = await supabase
        .from("payment_methods")
        .insert([{
          user_id: user.id,
          type: paymentMethodData.type,
          details: paymentMethodData.details,
          is_default: isDefault,
          created_at: new Date().toISOString()
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      const newMethod = data[0] as PaymentMethod;
      setPaymentMethods(prev => [...prev, newMethod]);
      
      toast.success("Payment method added successfully");
      return newMethod;
    } catch (err) {
      console.error("Error adding payment method:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add payment method");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set a payment method as default
  const setDefaultPaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      throw new Error("You must be logged in to update payment methods");
    }

    try {
      setLoading(true);
      
      // First, reset all payment methods to non-default
      const { error: resetError } = await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", user.id);
      
      if (resetError) {
        throw resetError;
      }
      
      // Then set the selected one as default
      const { error: updateError } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
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
      toast.error(err instanceof Error ? err.message : "Failed to update default payment method");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete a payment method
  const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      throw new Error("You must be logged in to delete payment methods");
    }

    try {
      setLoading(true);
      
      // Check if it's the default method
      const { data: methodData, error: checkError } = await supabase
        .from("payment_methods")
        .select("is_default")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();
      
      if (checkError) {
        throw checkError;
      }
      
      // Delete the payment method
      const { error: deleteError } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      const updatedMethods = paymentMethods.filter(method => method.id !== id);
      setPaymentMethods(updatedMethods);
      
      // If we deleted the default method and others exist, set a new default
      if (methodData.is_default && updatedMethods.length > 0) {
        await setDefaultPaymentMethod(updatedMethods[0].id);
      }
      
      toast.success("Payment method deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting payment method:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete payment method");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, paymentMethods, setDefaultPaymentMethod]);

  // Download an invoice for a payment
  const downloadInvoice = useCallback(async (paymentId: string): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to download invoices");
      return null;
    }

    try {
      setLoading(true);
      
      // Get payment details
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("invoice_url, status")
        .eq("id", paymentId)
        .eq("user_id", user.id)
        .single();
      
      if (paymentError) {
        throw paymentError;
      }
      
      if (!paymentData) {
        throw new Error("Payment not found");
      }
      
      if (paymentData.status !== "paid") {
        throw new Error("Invoice only available for paid payments");
      }
      
      if (!paymentData.invoice_url) {
        throw new Error("Invoice not available for this payment");
      }
      
      // In a real implementation, we would trigger a download or redirect to the invoice URL
      toast.success("Invoice download initiated");
      return paymentData.invoice_url;
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error(err instanceof Error ? err.message : "Failed to download invoice");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize by fetching data on component mount
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
    makePayment,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    downloadInvoice
  };
};