import { defaultSender, defaultSenderName } from "@/constants/booking-constant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { booking_id, user_email, reason, booking_details, refund_amount, refund_status } = await req.json();

    const hasRefund = refund_amount && refund_amount > 0;

    await fetch('https://api.brevo.com/v3/smtp/email', {
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
        subject: hasRefund ? '💸 Booking Cancelled - Refund Processing' : '🚫 Booking Cancelled',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Booking Cancellation Notice</h2>
            
            <p>Dear ${booking_details?.customerName || 'Customer'},</p>
            <p>We regret to inform you that your booking has been cancelled.</p>
            
            <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="margin-top: 0; color: #721c24;">Cancelled Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking_id}</p>
              <p><strong>Service:</strong> ${booking_details?.service || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking_details?.date || 'N/A'}</p>
              <p><strong>Address:</strong> ${booking_details?.address || 'N/A'}</p>
              <p><strong>Original Amount:</strong> $${booking_details?.amount || '0'}</p>
            </div>
            
            ${reason ? `
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">📝 Cancellation Reason</h4>
                <p style="color: #856404;">${reason}</p>
              </div>
            ` : ''}
            
            ${hasRefund ? `
              <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #155724; margin-top: 0;">💰 Refund Information</h3>
                <p style="color: #155724;"><strong>Refund Amount:</strong> $${refund_amount}</p>
                <p style="color: #155724;"><strong>Processing Time:</strong> 3-5 business days</p>
                <p style="color: #155724;"><strong>Refund Method:</strong> Original payment method</p>
                <p style="color: #155724;">You will receive a separate email confirmation once the refund is processed by your bank.</p>
              </div>
            ` : `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #dee2e6;">
                <p style="color: #6c757d; margin: 0;"><strong>Refund Status:</strong> No refund applicable for this cancellation</p>
              </div>
            `}
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">💬 Need Support?</h4>
              <p style="color: #1976d2;">If you have questions about this cancellation or refund:</p>
              <p style="color: #1976d2;">
                📞 <strong>Phone:</strong> (555) 123-4567<br>
                📧 <strong>Email:</strong> support@spotlesstransitions.com<br>
                🕒 <strong>Hours:</strong> Mon-Fri 9AM-6PM
              </p>
            </div>
            
            <p style="text-align: center; color: #666; font-style: italic;">
              We apologize for any inconvenience caused.<br>
              We hope to serve you again in the future.
            </p>
            
            <div style="background-color: #343a40; color: white; padding: 15px; text-align: center; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px;">© 2024 Domu Clean. All rights reserved.</p>
            </div>
          </div>
        `
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancellation email failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
