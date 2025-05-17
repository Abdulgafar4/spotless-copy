import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil", // Use the latest API version
})

export async function POST(request: Request) {
  try {
    const { amount, bookingRef, customerEmail, customerName, paymentOption } = await request.json()

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "cad",
      metadata: {
        bookingRef,
        paymentOption,
      },
      receipt_email: customerEmail,
      // Optionally save payment method for future use
      setup_future_usage: "off_session",
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Booking Payment - ${bookingRef} - ${paymentOption === "deposit" ? "70% Deposit" : "Full Payment"}`,
    })

    // Return client secret to the client
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    })

  } catch (error) {
    console.error("Stripe payment intent error:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}