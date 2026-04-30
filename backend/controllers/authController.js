const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authController = {

  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, role_id } = req.body;

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

      const userId = await userModel.createUser({
        name, email, password_hash, phone, role_id, otp, otp_expires_at,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email with OTP.',
        data: { user_id: userId, email, otp },
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Verify OTP
  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      if (Date.now() > new Date(user.otp_expires_at).getTime()) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
      }

await userModel.verifyEmail(user.user_id);

      // Generate JWT token (auto-login after OTP verification)
      const token = jwt.sign(
        { user_id: user.user_id, role_id: user.role_id, email: user.email, coaching_center_id: user.coaching_center_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Get full user with role_name
      const fullUser = await userModel.findById(user.user_id);
      delete fullUser.password_hash;
      delete fullUser.otp;
      delete fullUser.otp_expires_at;

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: { token, user: fullUser },
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Invalid email or password' });
      }

      if (!user.is_email_verified) {
        return res.status(400).json({ success: false, message: 'Please verify your email first' });
      }

      if (user.status !== 'active') {
        return res.status(400).json({ success: false, message: 'Your account has been suspended' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, role_id: user.role_id, email: user.email, coaching_center_id: user.coaching_center_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );


      // Get full user with role_name
      const fullUser = await userModel.findById(user.user_id);
      delete fullUser.password_hash;
      delete fullUser.otp;
      delete fullUser.otp_expires_at;

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { token, user: fullUser },
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Get current logged in user
  getMe: async (req, res) => {
    try {
      const user = await userModel.findById(req.user.user_id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      delete user.password_hash;
      delete user.otp;
      delete user.otp_expires_at;

      res.status(200).json({ success: true, data: user });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Email not found' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

      await userModel.saveOTP(user.user_id, otp, otp_expires_at);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
        data: { otp },
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    try {
      const { email, otp, new_password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      if (Date.now() > new Date(user.otp_expires_at).getTime()) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);

      await userModel.updatePassword(user.user_id, password_hash);

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Please login.',
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { name, phone, gender, date_of_birth, address, bio } = req.body;

      await userModel.updateProfile(req.user.user_id, {
        name, phone, gender, date_of_birth, address, bio,
      });

      res.status(200).json({ success: true, message: 'Profile updated successfully' });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { current_password, new_password } = req.body;

      const user = await userModel.findById(req.user.user_id);

      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
c
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);

      await userModel.updatePassword(req.user.user_id, password_hash);

      res.status(200).json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

};

module.exports = authController;
