const db = require("../config/db");

const userModel = {
  findByEmail: async (email) => {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  findById: async (user_id) => {
    const result = await db.query(
      `SELECT users.*, roles.role_name
       FROM users
       JOIN roles ON users.role_id = roles.role_id
       WHERE users.user_id = $1`,
      [user_id],
    );
    return result.rows[0];
  },

  createUser: async (userData) => {
    const { role_id, email, password_hash, name, phone, otp, otp_expires_at } =
      userData;
    const result = await db.query(
      `INSERT INTO users
       (role_id, email, password_hash, name, phone, otp, otp_expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING user_id`,
      [role_id, email, password_hash, name, phone, otp, otp_expires_at],
    );
    return result.rows[0].user_id;
  },

  verifyEmail: async (user_id) => {
    await db.query(
      `UPDATE users
       SET is_email_verified = TRUE, otp = NULL, otp_expires_at = NULL
       WHERE user_id = $1`,
      [user_id],
    );
  },

  saveOTP: async (user_id, otp, otp_expires_at) => {
    await db.query(
      `UPDATE users SET otp = $1, otp_expires_at = $2
       WHERE user_id = $3`,
      [otp, otp_expires_at, user_id],
    );
  },

  updatePassword: async (user_id, password_hash) => {
    await db.query(
      `UPDATE users
       SET password_hash = $1, otp = NULL, otp_expires_at = NULL
       WHERE user_id = $2`,
      [password_hash, user_id],
    );
  },

  updateProfile: async (user_id, profileData) => {
    const { name, phone, gender, date_of_birth, address, bio } = profileData;
    await db.query(
      `UPDATE users
       SET name=$1, phone=$2, gender=$3,
           date_of_birth=$4, address=$5, bio=$6
       WHERE user_id = $7`,
      [name, phone, gender, date_of_birth, address, bio, user_id],
    );
  },
};

module.exports = userModel;
