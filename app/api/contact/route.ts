import { defaultSender, defaultSenderName } from "@/constants/booking-constant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log('📧 Contact message admin notification triggered');
  
  try {
    const { 
      name, 
      email, 
      phone, 
      subject, 
      message,
      admin_email = 'etzteemmytee0@gmail.com' // fallback admin email
    } = await req.json();

    // Send notification to admin
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: { 
          email: "clever.metag@gmail.com",
          name: defaultSenderName
        },
        to: [{ email: admin_email }],
        subject: `New Contact Message: ${subject}`,
        htmlContent: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; color: #333333;">
            
            <!-- Header -->
            <div style="background-color: #2c3e50; color: #ffffff; padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 1px;">New Contact Message</h1>
              <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Website Inquiry - Immediate Attention Required</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">

              <!-- Customer Details -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 20px 0; font-weight: 500; padding-bottom: 10px; border-bottom: 2px solid #ecf0f1;">Customer Information</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #ecf0f1; width: 120px; font-weight: 500; color: #555555;">Full Name:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #ecf0f1; color: #333333;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #ecf0f1; font-weight: 500; color: #555555;">Email Address:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #ecf0f1;"><a href="mailto:${email}" style="color: #3498db; text-decoration: none;">${email}</a></td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #ecf0f1; font-weight: 500; color: #555555;">Phone Number:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #ecf0f1;"><a href="tel:${phone}" style="color: #3498db; text-decoration: none;">${phone}</a></td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 12px 0; font-weight: 500; color: #555555;">Subject:</td>
                    <td style="padding: 12px 0; color: #333333; font-weight: 500;">${subject}</td>
                  </tr>
                </table>
              </div>

              <!-- Message Content -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 20px 0; font-weight: 500; padding-bottom: 10px; border-bottom: 2px solid #ecf0f1;">Message Details</h3>
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border: 1px solid #e9ecef;">
                  <p style="color: #333333; line-height: 1.7; margin: 0; font-size: 15px; white-space: pre-wrap;">${message}</p>
                </div>
              </div>

              <!-- Action Items -->
              <div style="background-color: #ecf0f1; padding: 25px; border-radius: 6px; margin-bottom: 30px;">
                <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 20px 0; font-weight: 500;">Recommended Actions</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                  <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                     style="background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; font-size: 14px;">
                    Reply via Email
                  </a>
                  ${phone ? `
                    <a href="tel:${phone}" 
                       style="background-color: #27ae60; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; font-size: 14px;">
                      Call Customer
                    </a>
                  ` : ''}
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://spotlesstransitions.com'}/admin/" 
                     style="background-color: #95a5a6; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 500; font-size: 14px;">
                    View Dashboard
                  </a>
                </div>
              </div>

              <!-- Response Timeline -->
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                <p style="margin: 0; color: #856404; font-weight: 500; font-size: 14px;">
                  <strong>Response Required:</strong> Please respond to this inquiry within 24 hours to maintain our service standards.
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background-color: #34495e; color: #bdc3c7; padding: 25px 30px; text-align: center; font-size: 13px;">
              <p style="margin: 0 0 10px 0;">
                <strong style="color: #ffffff;">Domu Clean</strong> - Admin Notification System
              </p>
              <p style="margin: 0; opacity: 0.8;">
                This is an automated notification. Please do not reply to this email directly.
              </p>
            </div>
          </div>
        `
      })
    });

    const result = await response.json();

    return NextResponse.json({ 
      success: true, 
      emailId: result.messageId,
      message: 'Admin notification sent successfully'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to send admin notification',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}