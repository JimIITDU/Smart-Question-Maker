const nodemailer = require('nodemailer');
// Only load dotenv if we aren't in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  // Parse port as a number; default to 465 for production, 587 for local
  port: parseInt(process.env.EMAIL_PORT || '465'),
  
  // Logic: Use secure connection if Port is 465 OR if EMAIL_SECURE is explicitly true
  secure: process.env.EMAIL_PORT === '465' || process.env.EMAIL_SECURE === 'true',
  
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
  tls: {
    // This allows the connection even if the SSL certificate has issues
    rejectUnauthorized: false,
    // Helps Render's network resolve the address correctly
    servername: process.env.EMAIL_HOST 
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"ProshnoGhor" <${process.env.EMAIL_HOST_USER}>`,
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    // Detailed error logging to help you see what's happening in Render
    console.error('Email send failed. Configuration used:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_HOST_USER
    });
    console.error('Error details:', error);
    return false;
  }
};

module.exports = { sendOTP };