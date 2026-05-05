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

module.exports = { sendOTP };