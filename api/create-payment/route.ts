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
    const { booking_id, amount, return_url } = await req.json();

    // Validate inputs
    if (!booking_id || !amount) {
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

    // Get booking details to store in metadata
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('service_type, date')
      .eq('id', booking_id)
      .single();

    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      // Continue anyway, using just the booking_id in metadata
    }

    // Get user profile for better customer info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    if (profileError && !profileError.message.includes('not found')) {
      console.error('Error fetching profile:', profileError);
      // Continue anyway with basic user info
    }

    // Store temporary record of payment intent
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        user_id: user.id,
        amount,
        status: 'pending',
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: booking?.service_type || 'Cleaning Service',
              description: `Booking #${booking_id.substring(0, 8)}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${return_url || process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url || process.env.NEXT_PUBLIC_APP_URL}/payment/canceled`,
      customer_email: profile?.email || user.email,
      client_reference_id: user.id,
      payment_intent_data: {
        metadata: {
          booking_id,
          payment_id: paymentRecord.id,
          user_id: user.id,
        },
      },
      metadata: {
        booking_id,
        payment_id: paymentRecord.id,
        user_id: user.id, 
      },
    });

    // Store Stripe session ID with payment record
    await supabase
      .from('payments')
      .update({ stripe_session_id: session.id })
      .eq('id', paymentRecord.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Payment session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment session' },
      { status: 500 }
    );
  }
}