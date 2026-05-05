const { Resend } = require('resend');
// Only load dotenv if we aren't in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

let resend;
try {
  resend = new Resend(process.env.RESEND_API_KEY);
} catch (e) {
  console.warn('Email service unavailable - RESEND_API_KEY missing');
}

const sendOTP = async (email, otp) => {
  try {
    const data = await resend.emails.send({
      from: 'ProshnoGhor <onboarding@resend.dev>', // Use your verified sender or Resend's test sender
      to: email,
      subject: 'Your ProshnoGhor OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">Your OTP Code</h2>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes. Do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">&copy; 2024 ProshnoGhor</p>
        </div>
      `,
    });
    console.log('OTP sent:', data);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

const sendCenterApplicationEmail = async (email, centerName, userId) => {
  try {
    await resend.emails.send({
      from: 'ProshnoGhor Coaching <noreply@proshnoghor.com>',
      to: email,
      subject: `✅ Coaching Center Application Received - ${centerName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0; margin-bottom: 30px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">Application Submitted!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">${centerName}</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
            <h2 style="color: #1a202c; font-size: 24px; margin-bottom: 20px;">Dear Coaching Admin,</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for submitting your coaching center application for <strong>${centerName}</strong>.
            </p>
            
            <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
              <h3 style="color: #2d3748; margin: 0 0 10px 0; font-size: 18px;">📋 Next Steps:</h3>
              <ul style="color: #4a5568; margin: 0; padding-left: 20px;">
                <li>Our Super Admin team will review within <strong>2-3 working days</strong></li>
                <li>You'll receive email notification on approval/rejection</li>
                <li>Approved centers get full platform access immediately</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(90deg, #48bb78, #38a169); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;">
              <h3 style="margin: 0 0 10px 0; font-size: 20px;">Application ID: #${userId}</h3>
              <p style="margin: 0; font-size: 14px; opacity: 0.95;">Keep this for your reference</p>
            </div>
            
            <p style="font-size: 14px; color: #718096; margin-top: 30px;">
              Need help? Reply to this email or contact <a href="mailto:support@proshnoghor.com" style="color: #667eea;">support@proshnoghor.com</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
            <p style="text-align: center; font-size: 12px; color: #a0aec0;">
              © 2024 ProshnoGhor. All rights reserved. | <a href="https://proshnoghor.com" style="color: #667eea;">proshnoghor.com</a>
            </p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Center application confirmation sent to ${email}`);
  } catch (error) {
    console.error('Center application email failed:', error);
    throw error;
  }
};

module.exports = { sendOTP, sendCenterApplicationEmail };

