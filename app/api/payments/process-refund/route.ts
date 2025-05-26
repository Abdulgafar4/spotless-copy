import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-04-30.basil",
})

export async function POST(req: NextRequest) {
  try {
    const { 
      booking_id, 
      reason, 
      refund_amount, 
      admin_id,
      refund_type = 'full'
    } = await req.json();

    console.log(`💰 Processing refund for booking ${booking_id}`);

    // Get booking details including payment intent ID
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('reference_number', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.payment_status !== 'paid') {
      throw new Error('No payment to refund - booking was not paid');
    }

    // Check if we have payment intent ID stored in booking
    let paymentIntentId = booking.stripe_payment_intent_id;

    // If not in booking, try to get from payment_intents table
    if (!paymentIntentId) {
      const { data: paymentIntent, error: intentError } = await supabase
        .from('payment_intents')
        .select('stripe_payment_intent_id')
        .eq('booking_reference', booking_id)
        .eq('status', 'succeeded')
        .single();

      if (!intentError && paymentIntent) {
        paymentIntentId = paymentIntent.stripe_payment_intent_id;
      }
    }

    if (!paymentIntentId) {
      throw new Error('Payment intent ID not found - cannot process refund');
    }

    let refundResult = null;
    let refundStatus = 'none';

    // Process refund through Stripe if amount > 0
    if (refund_amount > 0) {
      try {
        refundResult = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: Math.round(refund_amount * 100), // Convert to cents
          reason: 'requested_by_customer',
          metadata: {
            booking_id: booking_id,
            admin_id: admin_id,
            reason: reason
          }
        });

        refundStatus = refundResult?.status ?? 'unknown';
        console.log('✅ Stripe refund created:', refundResult.id);

      } catch (stripeError) {
        console.error('❌ Stripe refund failed:', stripeError);
        const errorMessage = typeof stripeError === 'object' && stripeError !== null && 'message' in stripeError
          ? (stripeError as { message: string }).message
          : 'Unknown error';
        throw new Error(`Refund failed: ${errorMessage}`);
      }
    }

    // Update booking with refund information
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: refund_amount > 0 ? 'refunded' : 'paid',
        refund_amount: refund_amount,
        refund_status: refundStatus,
        refund_reason: reason,
        cancelled_by: admin_id,
        cancelled_at: new Date().toISOString(),
        stripe_refund_id: refundResult?.id
      })
      .eq('reference_number', booking_id);

    if (updateError) {
      throw new Error('Failed to update booking status');
    }

    // Create refund record
    if (refund_amount > 0) {
      const { error: refundRecordError } = await supabase
        .from('refunds')
        .insert({
          booking_id: booking.id,
          booking_reference: booking_id,
          amount: refund_amount,
          status: refundStatus,
          stripe_refund_id: refundResult?.id,
          stripe_payment_intent_id: paymentIntentId,
          reason: reason,
          processed_by: admin_id,
          processed_at: new Date().toISOString()
        });

      if (refundRecordError) {
        console.error('❌ Failed to create refund record:', refundRecordError);
      }
    }

    return NextResponse.json({
      success: true,
      refund_id: refundResult?.id,
      refund_status: refundStatus,
      refund_amount: refund_amount,
      payment_intent_id: paymentIntentId,
      message: refund_amount > 0 
        ? `Refund of $${refund_amount} processed successfully`
        : 'Booking cancelled without refund'
    });

  } catch (error) {
    console.error('❌ Refund processing error:', error);
    return NextResponse.json({
      error: typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : "Refund processing failed"
    }, { status: 500 });
  }
}
