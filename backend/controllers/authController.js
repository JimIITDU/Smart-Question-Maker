const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authController = {

  // Register new user
  register: async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        role_id,
      } = req.body;

      // Check if user already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

      // Create user
      const userId = await userModel.createUser({
        name,
        email,
        password_hash,
        phone,
        role_id,
        otp,
        otp_expires_at,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email with OTP.',
        data: {
          user_id: userId,
          email,
          otp, // in production this would be sent via email
        },
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Verify OTP
  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if OTP matches
      if (user.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      // Check if OTP is expired
      if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please register again.',
        });
      }

      // Mark email as verified
      await userModel.verifyEmail(user.user_id);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully. You can now login.',
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if email is verified
      if (!user.is_email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Please verify your email first',
        });
      }

      // Check if account is active
      if (user.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Your account has been suspended',
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          role_id: user.role_id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
          },
        },
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get current logged in user
  getMe: async (req, res) => {
    try {
      const user = await userModel.findById(req.user.user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Remove password from response
      delete user.password_hash;
      delete user.otp;

      res.status(200).json({
        success: true,
        data: user,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email not found',
        });
      }

      // Generate new OTP for password reset
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

      await userModel.saveOTP(user.user_id, otp, otp_expires_at);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
        data: {
          otp, // in production send via email
        },
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { email, otp, new_password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check OTP
      if (user.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      // Check expiry
      if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({
          success: false,
          message: 'OTP has expired',
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);

      await userModel.updatePassword(user.user_id, password_hash);

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Please login.',
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

};

module.exports = authController;