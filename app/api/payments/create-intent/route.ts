import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabaseClient"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil",
})

export async function POST(request: Request) {
  try {
    const { amount, bookingRef, customerEmail, customerName, paymentOption } = await request.json()

    console.log(`💳 Creating payment intent for booking ${bookingRef}: $${amount}`)

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "cad",
      metadata: {
        bookingRef,
        paymentOption,
        customerEmail,
        customerName
      },
      receipt_email: customerEmail,
      setup_future_usage: "off_session",
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Booking Payment - ${bookingRef} - ${paymentOption === "deposit" ? "70% Deposit" : "Full Payment"}`,
    })

    console.log(`✅ Payment intent created: ${paymentIntent.id}`)

    // Store payment intent record for future refund processing
    const { error: insertError } = await supabase
      .from('payment_intents')
      .insert({
        booking_reference: bookingRef,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: 'CAD',
        status: 'created',
        customer_email: customerEmail,
        customer_name: customerName,
        payment_option: paymentOption,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('❌ Failed to store payment intent:', insertError)
      // Don't fail the payment - just log the error
    } else {
      console.log(`📝 Payment intent stored in database: ${paymentIntent.id}`)
    }

    // Return client secret and payment intent ID
    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id // Return this for tracking
    })

  } catch (error) {
    console.error("❌ Stripe payment intent error:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}