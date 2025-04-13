"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { PaymentHistory } from "@/components/dashboard/payments/payment-hisotry";
import { PendingPayments } from "@/components/dashboard/payments/pending-payments";
import { PaymentMethods } from "@/components/dashboard/payments/payments-methods";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

interface PaymentMethod {
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
  user_id: string;
}

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: "paid" | "pending" | "refunded" | "failed";
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  date: string;
  invoice_url?: string;
  user_id: string;
  booking?: {
    id: string;
    service_type: string;
    date: string;
  };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("history");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      
      setPaymentMethods(data || []);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          booking:booking_id (
            id,
            service_type,
            date
          )
        `)
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (paymentsError) throw paymentsError;
      
      // Split into completed and pending payments
      const pending = paymentsData?.filter(p => p.status === "pending") || [];
      const completed = paymentsData?.filter(p => p.status !== "pending") || [];
      
      setPayments(completed);
      setPendingPayments(pending);
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch data on component mount
  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
      fetchPayments();
    }
  }, [user, fetchPaymentMethods, fetchPayments]);

  // Add payment method
  const handleAddPaymentMethod = async (paymentMethodData: Omit<PaymentMethod, "id" | "user_id" | "is_default">) => {
    if (!user) {
      toast.error("You must be logged in to add a payment method");
      return {} as PaymentMethod;
    }

    try {
      setLoading(true);
      
      // Check if this is the first payment method (make it default)
      const isDefault = paymentMethods.length === 0;
      
      // Insert new payment method
      const { data, error } = await supabase
        .from("payment_methods")
        .insert([
          {
            ...paymentMethodData,
            user_id: user.id,
            is_default: isDefault
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Payment method added successfully");
      
      // Refresh payment methods
      await fetchPaymentMethods();
      
      return data;
    } catch (err) {
      console.error("Error adding payment method:", err);
      toast.error("Failed to add payment method");
      return {} as PaymentMethod;
    } finally {
      setLoading(false);
    }
  };

  // Set default payment method
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user) {
      toast.error("You must be logged in to update payment methods");
      return false;
    }

    try {
      setLoading(true);
      
      // First, set all payment methods to non-default
      const { error: updateError } = await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      
      // Then set the selected one as default
      const { error: setDefaultError } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", paymentMethodId)
        .eq("user_id", user.id);

      if (setDefaultError) throw setDefaultError;
      
      toast.success("Default payment method updated");
      await fetchPaymentMethods();
      return true;
    } catch (err) {
      console.error("Error setting default payment method:", err);
      toast.error("Failed to update default payment method");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a payment method");
      return false;
    }

    try {
      setLoading(true);
      
      // First check if this is the default payment method
      const methodToDelete = paymentMethods.find(m => m.id === paymentMethodId);
      
      if (!methodToDelete) {
        throw new Error("Payment method not found");
      }
      
      // Delete the payment method
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", paymentMethodId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      // If this was the default payment method, set a new default
      if (methodToDelete.is_default && paymentMethods.length > 1) {
        const newDefault = paymentMethods.find(m => m.id !== paymentMethodId);
        if (newDefault) {
          await supabase
            .from("payment_methods")
            .update({ is_default: true })
            .eq("id", newDefault.id);
        }
      }
      
      toast.success("Payment method removed successfully");
      await fetchPaymentMethods();
      return true;
    } catch (err) {
      console.error("Error deleting payment method:", err);
      toast.error("Failed to remove payment method");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Make a payment
  const handleMakePayment = async (paymentId: string, methodId: string) => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return false;
    }

    try {
      setLoading(true);
      
      // In a real app, this would involve a payment processor
      // Here we'll just update the payment status
      const { error } = await supabase
        .from("payments")
        .update({ 
          status: "paid", 
          method: paymentMethods.find(m => m.id === methodId)?.type || "credit_card" 
        })
        .eq("id", paymentId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Payment completed successfully");
      await fetchPayments();
      return true;
    } catch (err) {
      console.error("Error processing payment:", err);
      toast.error("Failed to process payment");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">
          Manage your payments, billing history, and payment methods
        </p>
      </div>

      <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4 mt-6">
          <PaymentHistory payments={payments} />
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingPayments.length > 0 ? (
            <PendingPayments 
              payments={pendingPayments} 
              paymentMethods={paymentMethods}
              onMakePayment={handleMakePayment}
            />
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="text-lg font-medium">No Pending Payments</h3>
              <p className="text-gray-500 mt-2">You don't have any pending payments at the moment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="methods" className="space-y-4 mt-6">
          <PaymentMethods 
            paymentMethods={paymentMethods}
            onAddPaymentMethod={handleAddPaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
            onDelete={handleDeletePaymentMethod}
          />
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}