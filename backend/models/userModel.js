const db = require('../config/db');

const userModel = {

  findByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  findById: async (user_id) => {
    const [rows] = await db.query(
      `SELECT users.*, roles.role_name 
       FROM users 
       JOIN roles ON users.role_id = roles.role_id 
       WHERE users.user_id = ?`,
      [user_id]
    );
    return rows[0];
  },

  createUser: async (userData) => {
    const {
      role_id,
      email,
      password_hash,
      name,
      phone,
      otp,
      otp_expires_at,
    } = userData;

    const [result] = await db.query(
      `INSERT INTO users 
       (role_id, email, password_hash, name, phone, otp, otp_expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [role_id, email, password_hash, name, phone, otp, otp_expires_at]
    );
    return result.insertId;
  },

  verifyEmail: async (user_id) => {
    await db.query(
      `UPDATE users 
       SET is_email_verified = TRUE, otp = NULL, otp_expires_at = NULL 
       WHERE user_id = ?`,
      [user_id]
    );
  },

  saveOTP: async (user_id, otp, otp_expires_at) => {
    await db.query(
      `UPDATE users 
       SET otp = ?, otp_expires_at = ? 
       WHERE user_id = ?`,
      [otp, otp_expires_at, user_id]
    );
  },

  updatePassword: async (user_id, password_hash) => {
    await db.query(
      `UPDATE users 
       SET password_hash = ?, otp = NULL, otp_expires_at = NULL 
       WHERE user_id = ?`,
      [password_hash, user_id]
    );
  },

};

module.exports = userModel;