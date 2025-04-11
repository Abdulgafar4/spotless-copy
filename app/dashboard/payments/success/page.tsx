"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2, FileText, CalendarClock, MapPin, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Get the session ID from the URL
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!user) {
      // Not logged in yet, auth might still be initializing
      return;
    }
    
    async function fetchPaymentDetails() {
      try {
        setLoading(true);
        
        // Find the payment with this session ID
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("*")
          .eq("stripe_session_id", sessionId)
          .eq("user_id", user.id)
          .single();
          
        if (paymentError) {
          throw new Error("Could not find payment information");
        }
        
        setPayment(paymentData);
        
        // Now get the booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", paymentData.booking_id)
          .single();
          
        if (bookingError) {
          throw new Error("Could not find booking information");
        }
        
        setBooking(bookingData);
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("We couldn't find your payment details. Please contact support.");
      } finally {
        setLoading(false);
      }
    }
    
    if (sessionId) {
      fetchPaymentDetails();
    } else {
      // Try to find the most recent successful payment
      async function fetchLatestPayment() {
        try {
          setLoading(true);
          
          const { data: paymentData, error: paymentError } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "paid")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          if (paymentError) {
            throw new Error("Could not find recent payment information");
          }
          
          setPayment(paymentData);
          
          // Now get the booking details
          const { data: bookingData, error: bookingError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", paymentData.booking_id)
            .single();
            
          if (bookingError) {
            throw new Error("Could not find booking information");
          }
          
          setBooking(bookingData);
        } catch (err) {
          console.error("Error fetching latest payment:", err);
          setError("We couldn't find your recent payment details. Please check your dashboard.");
        } finally {
          setLoading(false);
        }
      }
      
      fetchLatestPayment();
    }
  }, [sessionId, user]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD' 
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 text-green-500 animate-spin mb-4" />
        <h1 className="text-2xl font-bold mb-2">Processing your payment</h1>
        <p className="text-gray-500 text-center max-w-md">
          Please wait while we confirm your payment details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Information</CardTitle>
              <CardDescription>There was a problem retrieving your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard/payments")}
              >
                Go to Payment History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 max-w-md">
            Your payment has been processed successfully. A confirmation email has been sent to your inbox.
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment #{payment?.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount Paid</span>
                <span className="text-xl font-bold">{payment && formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Payment Method</span>
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                  {payment?.method === "credit_card" ? "Credit Card" : 
                   payment?.method === "debit_card" ? "Debit Card" : 
                   payment?.method === "paypal" ? "PayPal" : "Payment Method"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Payment Date</span>
                <span>{payment?.date && formatDate(payment.date)}</span>
              </div>
            </div>
            
            <Separator />
            
            {booking && (
              <div className="space-y-3">
                <h3 className="font-medium">Booking Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.service_type}</span>
                      <span className="text-sm text-gray-500">{booking.date && formatDate(booking.date)}</span>
                    </div>
                  </div>
                  {booking.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <span className="text-sm">{booking.address}</span>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
                  <p className="text-blue-700">
                    Your booking status is now <strong>pending confirmation</strong>. Our admin team will review your booking and confirm the appointment soon.
                  </p>
                </div>
              </div>
            )}
            
            {payment?.invoice_url && (
              <div className="mt-4">
                <Link href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-2" />
                    View Receipt
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="w-full sm:w-auto" 
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => router.push("/dashboard/appointments")}
            >
              View Appointments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}