import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil",
})

// Webhook secret from Stripe dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const sig = (await headers()).get("stripe-signature") as string

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret as string)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Get Supabase client
  const supabase = createServerComponentClient({ cookies })

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Extract metadata
      const { bookingRef, paymentOption } = paymentIntent.metadata

      try {
        // Get current booking data to preserve fields
        const { data: currentBooking, error: fetchError } = await supabase
          .from("bookings")
          .select("*")
          .eq("reference_number", bookingRef)
          .single();
          
        if (fetchError) {
          console.error("Error fetching current booking:", fetchError);
          throw fetchError;
        }

        // Update booking status in database, preserving other fields
        const { error } = await supabase
          .from("bookings")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_id: paymentIntent.id,
            payment_method: paymentIntent.payment_method_types[0] || "card",
            payment_date: new Date().toISOString(),
            // Preserve existing fields we don't want to overwrite
            images: currentBooking.images
          })
          .eq("reference_number", bookingRef)

        if (error) {
          console.error("Error updating booking:", error)
          return NextResponse.json(
            { error: "Database update failed" },
            { status: 500 }
          )
        }

        // Handle additional processing if needed
        // For example, send confirmation emails or notifications

      } catch (error) {
        console.error("Error processing payment success:", error)
        return NextResponse.json(
          { error: "Failed to process payment success" },
          { status: 500 }
        )
      }
      break

    case "payment_intent.payment_failed":
      // Handle failed payment
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.error("Payment failed:", failedPaymentIntent.id)
      // Update booking status if needed
      break

    // Add other event types as needed
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}