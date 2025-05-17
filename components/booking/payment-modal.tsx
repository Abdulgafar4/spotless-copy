"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { StripePaymentWrapper } from "./stripe-payment-integration"

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef: string;
  paymentAmount: number;
  formatCurrency: (amount: number) => string;
  paymentOption: "full" | "deposit";
  totalAmount: number;
  bookingData: any; 
  files: File[]; 
}

export function PaymentModal({
  isOpen,
  onClose,
  bookingRef,
  paymentAmount,
  formatCurrency,
  paymentOption,
  totalAmount,
  bookingData,
  files
}: PaymentModalProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingCreated, setBookingCreated] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Initialize payment intent when modal opens
  useEffect(() => {
    if (isOpen && !clientSecret && !bookingCreated) {
      createBookingAndInitializePayment()
    }
  }, [isOpen, clientSecret, bookingCreated])

  // Create booking record and initialize Stripe payment
  const createBookingAndInitializePayment = async () => {
    setIsProcessing(true)
    setPaymentError(null)

    try {
      // First create the booking record with "pending" status
      const { data: bookingResult, error: bookingError } = await supabase
        .from("bookings")
        .insert([{ 
          ...bookingData,
          status: "pending",
          payment_status: "pending" 
        }])
        .select()

      if (bookingError) {
        throw bookingError
      }

      setBookingCreated(true)

      // Upload property photos and track URLs
      let imageUrls = [];
      if (files.length > 0) {
        const uploadPromises = files.map(file => {
          return supabase.storage.from("bookings").upload("booking-images", file)
        })

        try {
          const uploadResults = await Promise.all(uploadPromises)
          
          // Generate public URLs for each uploaded file
          for (let i = 0; i < uploadResults.length; i++) {
            const result = uploadResults[i]
            if (!result.error) {
              const path = `booking-images/${files[i].name}`
              const { data: urlData } = supabase.storage.from("bookings").getPublicUrl(path)
              if (urlData?.publicUrl) {
                imageUrls.push(urlData.publicUrl)
              }
            }
          }
          
          // Update the booking with image URLs
          if (imageUrls.length > 0) {
            const { error: updateError } = await supabase
              .from("bookings")
              .update({ images: imageUrls })
              .eq("reference_number", bookingRef)
              
            if (updateError) {
              console.error("Error updating booking with image URLs:", updateError)
            }
          }
          
          const uploadErrors = uploadResults
            .filter(result => result.error)
            .map(result => result.error)

          if (uploadErrors.length > 0) {
            console.error("Some files failed to upload:", uploadErrors)
          }
        } catch (uploadError) {
          console.error("Error uploading files:", uploadError)
          // Continue anyway - booking is more important than photos
        }
      }

      // Initialize Stripe payment intent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: paymentAmount,
          bookingRef,
          customerEmail: bookingData.customer_email,
          customerName: bookingData.customer_name,
          paymentOption
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initialize payment")
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error("Booking/payment initialization error:", error)
      setPaymentError(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : "Failed to initialize payment. Please try again.")
      toast.error("Failed to initialize payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }


  // Handle payment success
  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Your booking is confirmed.")
    router.push("/dashboard/booking-confirmation?ref=" + bookingRef)
    onClose()
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    setPaymentError(error)
    toast.error(error || "Payment failed. Please try again.")
  }

  // Reset state when modal closes
  const handleCloseModal = () => {
    // Don't immediately reset client secret to avoid UI flicker
    onClose()
    // If the booking was created but payment wasn't completed, we might want to clean up
    // Or alternatively let the webhook timeout handle it
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Booking
          </DialogTitle>
          <DialogDescription>
            Proceed to payment to confirm your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Due</span>
              <span className="text-xl font-bold">{formatCurrency(paymentAmount)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {paymentOption === "deposit"
                ? `Deposit only (remaining balance of ${formatCurrency(totalAmount - paymentAmount)} due after service)`
                : "Full payment with 5% discount applied"}
            </div>
          </div>

          {paymentError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              <p className="font-medium">Payment Error</p>
              <p>{paymentError}</p>
            </div>
          )}

          {isProcessing && !clientSecret ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
              <p className="text-sm text-gray-600">Initializing payment...</p>
            </div>
          ) : clientSecret ? (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Payment Information</h3>
              <StripePaymentWrapper
                clientSecret={clientSecret}
                amount={paymentAmount}
                bookingRef={bookingRef}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Important Information</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Please reference booking number <strong>{bookingRef}</strong> in any communication.
                  </p>
                  <p className="text-sm text-yellow-700">
                    {paymentOption === "deposit"
                      ? `You're paying a 70% deposit (${formatCurrency(paymentAmount)}). The remaining balance of ${formatCurrency(totalAmount - paymentAmount)} will be due after service completion.`
                      : "You're paying the full amount with a 5% discount applied."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            className="sm:w-auto w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          {!clientSecret && !isProcessing && (
            <Button
              onClick={createBookingAndInitializePayment}
              className="bg-[#10b981] hover:bg-[#0d9668] text-white sm:w-auto w-full"
              disabled={isProcessing}
            >
              Proceed to Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}