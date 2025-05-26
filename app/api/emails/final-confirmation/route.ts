import { defaultSender, defaultSenderName } from "@/constants/booking-constant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log('📧 Final confirmation email triggered');
  
  try {
    const { booking_id, user_email, booking_details, invoice_url } = await req.json();
    

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
        subject: '🎉 Final Booking Confirmation - Spotless Transitions',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🎉 Booking Confirmed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your service is all set and ready to go</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
                Dear <strong>${booking_details?.customerName || 'Valued Customer'}</strong>,
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Great news! Your booking has been fully confirmed and scheduled. 
                We're excited to provide you with exceptional service.
              </p>

              <!-- Booking Summary Card -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 25px; margin: 25px 0; border-radius: 8px;">
                <h3 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">📋 Booking Summary</h3>
                
                <div style="display: grid; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <span style="font-weight: 600; color: #495057;">Booking ID:</span>
                    <span style="color: #6c757d;">${booking_id}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <span style="font-weight: 600; color: #495057;">Service:</span>
                    <span style="color: #6c757d;">${booking_details?.service || 'N/A'}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <span style="font-weight: 600; color: #495057;">Date & Time:</span>
                    <span style="color: #6c757d;">${booking_details?.date || 'N/A'}</span>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                    <span style="font-weight: 600; color: #495057;">Location:</span>
                    <span style="color: #6c757d;">${booking_details?.address || 'N/A'}</span>
                  </div>
                  
                  ${booking_details?.assignedStaff?.length 
                    ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
                         <span style="font-weight: 600; color: #495057;">Assigned Staff:</span>
                         <span style="color: #6c757d;">${booking_details.assignedStaff.join(', ')}</span>
                       </div>`
                    : ''
                  }
                  
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; font-weight: bold; font-size: 16px; color: #28a745;">
                    <span>Total Amount:</span>
                    <span>$${booking_details?.amount || '0'}</span>
                  </div>
                </div>
              </div>

              <!-- Invoice Section -->
              ${invoice_url 
                ? `<div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                     <h4 style="color: #1976d2; margin-top: 0;">📄 Invoice Ready</h4>
                     <p style="color: #666; margin-bottom: 15px;">Your invoice is ready for download</p>
                     <a href="${invoice_url}" 
                        style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                       📥 Download Invoice
                     </a>
                   </div>`
                : `<div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                     <p style="color: #856404; margin: 0;">📄 Invoice will be sent separately</p>
                   </div>`
              }

              <!-- What's Next Section -->
              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: #0066cc; margin-top: 0;">🚀 What's Next?</h4>
                <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                  <li>Our team will arrive at the scheduled time</li>
                  <li>We'll contact you 24 hours before to confirm</li>
                  <li>Have any questions? Reply to this email</li>
                  <li>Rate your experience after service completion</li>
                </ul>
              </div>

              <!-- Contact Information -->
              <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin-top: 30px;">
                <h4 style="color: #333; margin-top: 0;">Need Help?</h4>
                <p style="color: #666; margin: 10px 0;">
                  📞 <strong>Phone:</strong> (555) 123-4567<br>
                  📧 <strong>Email:</strong> support@spotlesstransitions.com<br>
                  🌐 <strong>Website:</strong> www.spotlesstransitions.com
                </p>
              </div>

              <p style="text-align: center; color: #666; font-style: italic; margin-top: 30px;">
                Thank you for choosing Spotless Transitions!<br>
                We look forward to exceeding your expectations.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #343a40; color: white; padding: 20px; text-align: center; font-size: 14px;">
              <p style="margin: 0; opacity: 0.8;">
                © 2024 Spotless Transitions. All rights reserved.
              </p>
            </div>
          </div>
        `
      })
    });

    const result = await response.json();
    console.log('✅ Final confirmation sent:', result);

    return NextResponse.json({ 
      success: true, 
      emailId: result.messageId,
      message: 'Final confirmation sent successfully'
    });

  } catch (error) {
    console.error('❌ Final confirmation failed:', error);
    return NextResponse.json({ 
      error: 'Failed to send final confirmation',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}