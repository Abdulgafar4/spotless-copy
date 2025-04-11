import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { booking_id, payment_method_id, amount } = await req.json();

    // Validate inputs
    if (!booking_id || !payment_method_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create authenticated supabase client using the request
    const supabaseServerClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
        },
      }
    );

    // Get user data 
    const { data: { user } } = await supabaseServerClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the payment method to verify it belongs to the user
    const { data: paymentMethod, error: paymentMethodError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', payment_method_id)
      .eq('user_id', user.id)
      .single();

    if (paymentMethodError || !paymentMethod) {
      console.error('Error fetching payment method:', paymentMethodError);
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return NextResponse.json(
        { error: 'Invalid booking' },
        { status: 400 }
      );
    }

    // Store a record of the payment attempt
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        user_id: user.id,
        amount,
        status: 'pending',
        method: paymentMethod.type,
        method_id: payment_method_id,
        date: new Date().toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'pending' })
      .eq('id', booking_id);

    let stripeCustomerId: string;

    // Check if user has a Stripe customer ID
    const { data: stripeCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_id')
      .eq('user_id', user.id)
      .single();

    if (!stripeCustomer) {
      // Create a new Stripe customer
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      const customer = await stripe.customers.create({
        email: user.email,
        name: profile ? `${profile.first_name} ${profile.last_name}` : undefined,
        metadata: {
          user_id: user.id
        }
      });

      stripeCustomerId = customer.id;

      // Store the customer ID for future use
      await supabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          stripe_id: stripeCustomerId
        });
    } else {
      stripeCustomerId = stripeCustomer.stripe_id;
    }

    try {
      // If we don't have a Stripe payment method ID stored, we can't proceed
      if (!paymentMethod.stripe_payment_method_id) {
        throw new Error('No Stripe payment method ID found');
      }

      // Create payment intent with the saved payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'cad',
        customer: stripeCustomerId,
        payment_method: paymentMethod.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        metadata: {
          booking_id,
          payment_id: paymentRecord.id,
          user_id: user.id
        }
      });

      // Update payment record with the payment intent ID
      await supabase
        .from('payments')
        .update({
          stripe_payment_intent_id: paymentIntent.id
        })
        .eq('id', paymentRecord.id);

      // If payment intent is successful, update booking and payment status
      if (paymentIntent.status === 'succeeded') {
        // Get receipt URL
        let receipt = null;
        if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge as string
          );
          receipt = charge.receipt_url;
        }

        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'paid',
            invoice_url: receipt,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentRecord.id);

        // Update booking status
        await supabase
          .from('bookings')
          .update({
            status: 'pending_confirmation',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking_id);

        return NextResponse.json({
          success: true,
          paymentIntentId: paymentIntent.id
        });
      } else {
        // Payment is processing or requires action
        return NextResponse.json({
          success: false,
          message: 'Payment is processing or requires additional action',
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        });
      }
    } catch (stripeError: any) {
      console.error('Stripe payment processing error:', stripeError);
      
      // Update payment record to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: stripeError.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentRecord.id);

      return NextResponse.json(
        { 
          success: false, 
          message: stripeError.message || 'Payment processing failed'
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to process payment'
      },
      { status: 500 }
    );
  }
}