const db = require('../config/db');

const centerModel = {

  createCenter: async (data) => {
    const {
      user_id, center_name, location,
      contact_number, email, established_date,
    } = data;
    const result = await db.query(
      `INSERT INTO coaching_center
       (user_id, center_name, location, contact_number, email, established_date)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING coaching_center_id`,
      [user_id, center_name, location, contact_number, email, established_date]
    );
    return result.rows[0].coaching_center_id;
  },

  getAllCenters: async () => {
    const result = await db.query(
      'SELECT * FROM coaching_center ORDER BY created_at DESC'
    );
    return result.rows;
  },

  getCenterById: async (id) => {
    const result = await db.query(
      'SELECT * FROM coaching_center WHERE coaching_center_id = $1', [id]
    );
    return result.rows[0];
  },

  getCenterByUserId: async (user_id) => {
    const result = await db.query(
      'SELECT * FROM coaching_center WHERE user_id = $1', [user_id]
    );
    return result.rows[0];
  },

  updateCenterStatus: async (id, status) => {
    await db.query(
      'UPDATE coaching_center SET status = $1 WHERE coaching_center_id = $2',
      [status, id]
    );
  },

  updateCenter: async (id, data) => {
    const { center_name, location, contact_number, email } = data;
    await db.query(
      `UPDATE coaching_center
       SET center_name=$1, location=$2, contact_number=$3, email=$4
       WHERE coaching_center_id = $5`,
      [center_name, location, contact_number, email, id]
    );
  },

};

module.exports = centerModel;