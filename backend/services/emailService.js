const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
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
        <p style="color: #666; font-size: 12px;">&amp;copy; 2024 ProshnoGhor</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
};

module.exports = { sendOTP };

