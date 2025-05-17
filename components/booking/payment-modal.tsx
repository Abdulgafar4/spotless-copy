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
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

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

  const handlePayment = async () => {
    // Simulate payment processing with Stripe
    setIsProcessing(true)

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // After successful payment, create the booking record
      const { data: bookingResult, error: bookingError } = await supabase
        .from("bookings")
        .insert([bookingData])

      if (bookingError) {
        throw bookingError
      }

      // Upload property photos
      if (files.length > 0) {
        const uploadPromises = files.map(file => {
          const path = `${bookingRef}/${file.name}`
          return supabase.storage.from("bookings").upload("booking_images/" + path, file)
        })

        const uploadResults = await Promise.all(uploadPromises)
        const uploadErrors = uploadResults
          .filter(result => result.error)
          .map(result => result.error)

        if (uploadErrors.length > 0) {
          console.error("Some files failed to upload:", uploadErrors)
          // Continue anyway - booking is more important than photos
        }
      }

      toast.success("Payment successful! Your booking will be confirm.")
      router.push("/dashboard/booking-history")
      onClose()
    } catch (error) {
      console.error("Payment/booking error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Payment Details</h3>
            <p className="text-sm text-blue-700">
              You will be redirected to our secure payment processor to complete your payment.
              All payment information is encrypted and secure.
            </p>
          </div>

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
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:w-auto w-full"
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button
            onClick={handlePayment}
            className="bg-[#10b981] hover:bg-[#0d9668] text-white sm:w-auto w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              "Process Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}