"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePayments } from "@/hooks/use-payments";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { PendingPayments } from "@/components/dashboard/payments/pending-payments";
import { Loader2,  FileText, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentHistory } from "@/components/dashboard/payments/payment-hisotry";
import { PaymentMethods } from "@/components/dashboard/payments/payments-methods";

export default function Payments() {
  const { user } = useAuth();
  const { 
    payments, 
    pendingPayments, 
    paymentMethods,
    loading, 
    error,
    processPaymentWithSavedMethod,
    addPaymentMethod,
    setDefaultPaymentMethod,
    deletePaymentMethod
  } = usePayments();
  
  const [activeTab, setActiveTab] = useState("pending");

  // Auto-switch to the pending tab if there are pending payments
  useEffect(() => {
    if (pendingPayments.length > 0 && !loading) {
      setActiveTab("pending");
    }
  }, [pendingPayments, loading]);

  const handleMakePayment = async (paymentId: string, methodId: string) => {
    // Find the payment in pending payments
    const payment = pendingPayments.find((p) => p.id === paymentId);
    if (!payment) {
      toast.error("Payment not found");
      return false;
    }

    return await processPaymentWithSavedMethod({
      booking_id: payment.booking_id,
      payment_method_id: methodId,
      amount: payment.amount,
      return_url: `${window.location.origin}/dashboard/payments`
    });
  };

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending Payments
            {pendingPayments.length > 0 && (
              <span className="absolute top-0 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {pendingPayments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Pending Payments</CardTitle>
              <CardDescription>
                Complete payments for your upcoming services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading pending payments</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">No pending payments</p>
                  <p className="text-sm mt-1">You're all caught up! There are no pending payments.</p>
                </div>
              ) : (
                <PendingPayments 
                  payments={pendingPayments} 
                  paymentMethods={paymentMethods}
                  onMakePayment={handleMakePayment}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Payment History</CardTitle>
              <CardDescription>
                View your past payments and download invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading payment history</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : payments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="font-medium">No payment history found</p>
                  <p className="text-sm mt-1">You haven't made any payments yet</p>
                </div>
              ) : (
                <PaymentHistory payments={payments} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="methods">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <p>Error loading payment methods</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <PaymentMethods
                  paymentMethods={paymentMethods} 
                  onAddPaymentMethod={addPaymentMethod}
                  onSetDefault={setDefaultPaymentMethod}
                  onDelete={deletePaymentMethod}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}