import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { 
      booking_id, 
      user_email, 
      status, 
      adjustments, 
      booking_details,
      price_change,
      original_price,
      new_price
    } = await req.json();

    const isApproved = status === 'confirmed';
    const hasPriceChange = price_change && price_change !== 0;

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: { 
          email: 'no-reply@brevo.com',
          name: 'Domu Clean'
        },
        to: [{ email: user_email }],
        subject: isApproved 
          ? (hasPriceChange ? '✅ Booking Confirmed - Price Updated' : '✅ Booking Confirmed') 
          : '⚠️ Booking Needs Updates',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${isApproved ? '#28a745' : '#dc3545'};">
              ${isApproved ? 'Booking Confirmed!' : 'Booking Requires Updates'}
            </h2>
            
            <p>Dear ${booking_details?.customerName || 'Customer'},</p>
            <p>Your booking <strong>${booking_id}</strong> has been reviewed by our admin team.</p>
            
            <div style="background-color: ${isApproved ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isApproved ? '#28a745' : '#dc3545'};">
              <h3 style="margin-top: 0;">Booking Status: <span style="color: ${isApproved ? '#28a745' : '#dc3545'};">${isApproved ? 'CONFIRMED' : 'NEEDS UPDATES'}</span></h3>
              
              <p><strong>Service:</strong> ${booking_details?.service || 'N/A'}</p>
              <p><strong>Date:</strong> ${booking_details?.date || 'N/A'}</p>
              <p><strong>Address:</strong> ${booking_details?.address || 'N/A'}</p>
              
              ${hasPriceChange ? `
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 3px solid #ffc107;">
                  <h4 style="color: #856404; margin-top: 0;">💰 Price Update</h4>
                  <p style="color: #856404;">
                    <strong>Original Amount:</strong> $${original_price}<br>
                    <strong>Updated Amount:</strong> $${new_price}<br>
                    <strong>Change:</strong> ${price_change > 0 ? '+' : ''}$${price_change}
                  </p>
                </div>
              ` : ''}
            </div>
            
            ${adjustments ? `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4>📝 Admin Notes:</h4>
                <p>${adjustments}</p>
              </div>
            ` : ''}
            
            ${isApproved ? `
              <p style="color: #28a745; font-weight: bold;">Your booking is now confirmed and scheduled!</p>
              ${hasPriceChange ? `<p><strong>Note:</strong> Due to the price change, you may need to make an additional payment or receive a refund. We'll contact you shortly with payment details.</p>` : ''}
            ` : `
              <p><strong>Next Steps:</strong> Please contact us to resolve the items mentioned above. Your booking will be confirmed once these are addressed.</p>
            `}
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
              <p><strong>Need Help?</strong></p>
              <p>📞 Phone: (555) 123-4567<br>
              📧 Email: support@domuclean.com</p>
            </div>
            
            <p>Thank you for choosing Domu Clean!</p>
          </div>
        `
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin review email failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}