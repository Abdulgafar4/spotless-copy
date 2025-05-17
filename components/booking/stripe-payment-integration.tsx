"use client"

import { useState } from "react"
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Initialize Stripe (replace with your actual publishable key)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

interface StripeCheckoutProps {
  clientSecret: string
  amount: number
  bookingRef: string
  onSuccess: () => void
  onError: (error: string) => void
}

// Component that contains the Stripe Elements
export function StripePaymentForm({
  clientSecret,
  amount,
  bookingRef,
  onSuccess,
  onError
}: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/booking-confirmation?ref=${bookingRef}`,
        },
        redirect: 'if_required',
      })

      if (error) {
        // Show error to customer
        setErrorMessage(error.message || "Something went wrong with your payment")
        onError(error.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment success!
        onSuccess()
      } else {
        // Payment may be pending, requires additional action, or failed
        setErrorMessage("Payment could not be completed. Please try again.")
        onError("Payment could not be completed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setErrorMessage("An unexpected error occurred")
      onError("An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full bg-[#10b981] hover:bg-[#0d9668] text-white"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
          }).format(amount)}`
        )}
      </Button>
    </form>
  )
}

// Wrapper component that provides Stripe Elements
export function StripePaymentWrapper({
  clientSecret,
  amount,
  bookingRef,
  onSuccess,
  onError
}: StripeCheckoutProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#10b981',
      },
    },
  }

  if (!clientSecret) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm 
        clientSecret={clientSecret}
        amount={amount}
        bookingRef={bookingRef}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}