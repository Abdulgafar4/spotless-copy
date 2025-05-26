
import { defaultSender, defaultSenderName } from '@/constants/booking-constant';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { booking_id, user_email, payment_details, booking_details } = await req.json();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: { 
          email: defaultSender, 
          name: defaultSenderName 
        },
        to: [{ email: user_email }],
        subject: 'Payment Confirmed ✅',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Payment Successful! 💳</h2>
            <p>Dear Customer,</p>
            <p>Your payment has been processed successfully.</p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0;">Payment Details:</h3>
              <p><strong>Amount:</strong> $${payment_details?.amount || '0'}</p>
              <p><strong>Booking ID:</strong> ${booking_id}</p>
              <p><strong>Service:</strong> ${booking_details?.service || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking_details?.date || 'N/A'}</p>
            </div>
            
            <p>Thank you for your payment! Your booking is now confirmed.</p>
          </div>
        `
      })
    });

    const result = await response.json();
    return NextResponse.json({ success: true, emailId: result.messageId });

  } catch (error) {
    console.error('Payment confirmation email failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
