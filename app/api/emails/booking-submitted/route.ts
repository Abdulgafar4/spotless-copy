import { defaultSender, defaultSenderName } from '@/constants/booking-constant';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('📧 Booking submission email triggered');
  
  try {
    const { booking_id, user_email, admin_email, booking_details } = await req.json();
    
    // Send to customer
    const customerResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: { 
          email: defaultSender, // Change this to your domain
          name: defaultSenderName
        },
        to: [{ email: user_email }],
        subject: 'Booking Submitted Successfully',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Booking Submitted Successfully! ✅</h2>
            <p>Dear Customer,</p>
            <p>Your booking has been submitted and is under review.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Booking ID:</strong> ${booking_id}</p>
              <p><strong>Service:</strong> ${booking_details?.service || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking_details?.date || 'N/A'}</p>
              <p><strong>Customer:</strong> ${booking_details?.customerName || 'N/A'}</p>
            </div>
            
            <p>We'll review your booking and contact you shortly with confirmation.</p>
            <p>Thank you for choosing our services!</p>
          </div>
        `
      })
    });

    const customerResult = await customerResponse.json();
    console.log('✅ Customer email sent:', customerResult);

    // Send to admin
    const adminResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
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
        to: [{ email: admin_email || 'admin@yourdomain.com' }],
        subject: '🔔 New Booking Submission',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">New Booking Submitted! 🚨</h2>
            <p>A new booking requires your attention.</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0;">Booking Details:</h3>
              <p><strong>Booking ID:</strong> ${booking_id}</p>
              <p><strong>Customer:</strong> ${booking_details?.customerName || 'N/A'}</p>
              <p><strong>Email:</strong> ${user_email}</p>
              <p><strong>Phone:</strong> ${booking_details?.customerPhone || 'N/A'}</p>
              <p><strong>Service:</strong> ${booking_details?.service || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking_details?.date || 'N/A'}</p>
              <p><strong>Amount:</strong> $${booking_details?.amount || '0'}</p>
            </div>
            
            <p><strong>Action Required:</strong> Please review and confirm this booking in your admin dashboard.</p>
          </div>
        `
      })
    });

    const adminResult = await adminResponse.json();
    console.log('✅ Admin email sent:', adminResult);

    return NextResponse.json({ 
      success: true, 
      customerEmailId: customerResult.messageId,
      adminEmailId: adminResult.messageId
    });

  } catch (error) {
    console.error('❌ Failed to send booking emails:', error);
    return NextResponse.json({ 
      error: 'Failed to send emails',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}