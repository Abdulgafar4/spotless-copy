import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// This is needed because we're working with raw body data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body as text
async function getRawBody(request: NextRequest): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  
  // Read all chunks
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine all chunks into a single Uint8Array
  const allChunks = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  
  let position = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, position);
    position += chunk.length;
  }
  
  // Convert to string
  return new TextDecoder('utf-8').decode(allChunks);
}

export async function POST(req: NextRequest) {
  try {
    const body = await getRawBody(req);
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify the event came from Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleExpiredSession(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPaymentIntent(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedPaymentIntent(paymentIntent);
        break;
      }
      case 'payment_method.attached': {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        // Could handle storing payment methods here if needed
        break;
      }
      // Handle more events as needed
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle a successful checkout session completion
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  const paymentId = session.metadata?.payment_id;
  const userId = session.metadata?.user_id || session.client_reference_id;

  if (!bookingId || !paymentId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get payment intent if available
  let paymentIntentId: string | undefined;
  let receipt: string | null = null;

  if (session.payment_intent) {
    const paymentIntentObj = await stripe.paymentIntents.retrieve(
      session.payment_intent as string
    );
    paymentIntentId = paymentIntentObj.id;
    
    // Get latest charge for receipt
    if (paymentIntentObj.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntentObj.latest_charge as string
      );
      receipt = charge.receipt_url;
    }
  }

  try {
    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
        method: 'credit_card', // Default for Checkout
        invoice_url: receipt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'pending_confirmation', // Admin needs to confirm
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    // Optionally notify admin of new paid booking
    // ...

    console.log(`✅ Payment for booking ${bookingId} completed successfully`);
  } catch (error) {
    console.error('Error updating database after payment:', error);
  }
}

/**
 * Handle an expired checkout session
 */
async function handleExpiredSession(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  const paymentId = session.metadata?.payment_id;

  if (!bookingId || !paymentId) {
    console.error('Missing metadata in expired session');
    return;
  }

  try {
    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    // No need to update booking status - it remains unpaid

    console.log(`❌ Payment session for booking ${bookingId} expired`);
  } catch (error) {
    console.error('Error updating database after session expiry:', error);
  }
}

/**
 * Handle a successful payment intent (used for saved payment methods)
 */
async function handleSuccessfulPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.booking_id;
  
  if (!bookingId) {
    console.error('Missing booking_id in payment intent metadata');
    return;
  }

  try {
    // Get receipt URL from the charge
    let receipt: string | null = null;
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string
      );
      receipt = charge.receipt_url;
    }

    // Find related payment record
    const { data: paymentData } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (paymentData && paymentData.length > 0) {
      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          stripe_payment_intent_id: paymentIntent.id,
          invoice_url: receipt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentData[0].id);
    } else {
      // Create new payment record if none exists
      await supabase.from('payments').insert({
        booking_id: bookingId,
        user_id: paymentIntent.metadata?.user_id,
        amount: paymentIntent.amount / 100, // Convert from cents
        status: 'paid',
        method: 'credit_card', // Default
        stripe_payment_intent_id: paymentIntent.id,
        invoice_url: receipt,
        date: new Date().toISOString().split('T')[0],
      });
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'pending_confirmation',
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    console.log(`✅ Payment intent ${paymentIntent.id} succeeded for booking ${bookingId}`);
  } catch (error) {
    console.error('Error processing successful payment intent:', error);
  }
}

/**
 * Handle a failed payment intent
 */
async function handleFailedPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.booking_id;
  
  if (!bookingId) {
    console.error('Missing booking_id in payment intent metadata');
    return;
  }

  try {
    // Find related payment record
    const { data: paymentData } = await supabase
      .from('payments')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

    if (paymentData && paymentData.length > 0) {
      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          stripe_payment_intent_id: paymentIntent.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentData[0].id);
    } else {
      // Create new payment record if none exists
      await supabase.from('payments').insert({
        booking_id: bookingId,
        user_id: paymentIntent.metadata?.user_id,
        amount: paymentIntent.amount / 100, // Convert from cents
        status: 'failed',
        method: 'credit_card', // Default
        stripe_payment_intent_id: paymentIntent.id,
        date: new Date().toISOString().split('T')[0],
      });
    }

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    console.log(`❌ Payment intent ${paymentIntent.id} failed for booking ${bookingId}`);
  } catch (error) {
    console.error('Error processing failed payment intent:', error);
  }
}