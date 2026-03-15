const db = require('../config/db');

const centerModel = {

  createCenter: async (centerData) => {
    const {
      user_id,
      center_name,
      location,
      contact_number,
      email,
      established_date,
    } = centerData;

    const [result] = await db.query(
      `INSERT INTO coaching_center 
       (user_id, center_name, location, contact_number, email, established_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, center_name, location, contact_number, email, established_date]
    );
    return result.insertId;
  },

  getAllCenters: async () => {
    const [rows] = await db.query(
      `SELECT coaching_center.*, users.name as owner_name, 
       users.email as owner_email
       FROM coaching_center
       JOIN users ON coaching_center.user_id = users.user_id`
    );
    return rows;
  },

  getCenterById: async (coaching_center_id) => {
    const [rows] = await db.query(
      `SELECT coaching_center.*, users.name as owner_name,
       users.email as owner_email
       FROM coaching_center
       JOIN users ON coaching_center.user_id = users.user_id
       WHERE coaching_center.coaching_center_id = ?`,
      [coaching_center_id]
    );
    return rows[0];
  },

  getCenterByUserId: async (user_id) => {
    const [rows] = await db.query(
      `SELECT * FROM coaching_center 
       WHERE user_id = ?`,
      [user_id]
    );
    return rows[0];
  },

  updateCenterStatus: async (coaching_center_id, status) => {
    await db.query(
      `UPDATE coaching_center 
       SET status = ? 
       WHERE coaching_center_id = ?`,
      [status, coaching_center_id]
    );
  },

  updateCenter: async (coaching_center_id, centerData) => {
    const {
      center_name,
      location,
      contact_number,
      email,
      established_date,
    } = centerData;

    await db.query(
      `UPDATE coaching_center 
       SET center_name = ?, location = ?, 
       contact_number = ?, email = ?,
       established_date = ?
       WHERE coaching_center_id = ?`,
      [center_name, location, contact_number, 
       email, established_date, coaching_center_id]
    );
  },

};

module.exports = centerModel;