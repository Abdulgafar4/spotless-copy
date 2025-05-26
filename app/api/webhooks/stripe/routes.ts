import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`🔔 Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingRef = paymentIntent.metadata.bookingRef;
  
  console.log(`✅ Payment succeeded for booking ${bookingRef}: ${paymentIntent.id}`);

  // Update payment intent record
  const { error: updateError } = await supabase
    .from('payment_intents')
    .update({
      status: 'succeeded',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (updateError) {
    console.error('❌ Failed to update payment intent status:', updateError);
  }

  // Update booking payment status if booking exists
  const { error: bookingUpdateError } = await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id // Store for refunds
    })
    .eq('reference_number', bookingRef);

  if (bookingUpdateError) {
    console.error('❌ Failed to update booking payment status:', bookingUpdateError);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingRef = paymentIntent.metadata.bookingRef;
  
  console.log(`❌ Payment failed for booking ${bookingRef}: ${paymentIntent.id}`);

  // Update payment intent record
  const { error: updateError } = await supabase
    .from('payment_intents')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (updateError) {
    console.error('❌ Failed to update payment intent status:', updateError);
  }
}