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
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       ORDER BY cc.created_at DESC`
    );
    return result.rows;
  },

  getCenterById: async (id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.coaching_center_id = $1`, [id]
    );
    return result.rows[0];
  },

  getCenterByUserId: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1`, [user_id]
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

  // Get center subscription details
  getCenterSubscription: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, 
              sp.features as plan_features, sp.max_students, sp.max_courses,
              sp.max_exams, sp.ai_questions_limit, sp.support_level
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1`, [user_id]
    );
    return result.rows[0];
  },

  // Update center subscription
  updateCenterSubscription: async (centerId, planId) => {
    const result = await db.query(
      `UPDATE coaching_center 
       SET current_plan_id = $1, 
           subscription_start = NOW(),
           subscription_end = NOW() + INTERVAL '30 days',
           access_type = CASE WHEN $1 = 1 THEN 'free' ELSE 'paid' END
       WHERE coaching_center_id = $2
       RETURNING *`,
      [planId, centerId]
    );
    return result.rows[0];
  },

};

module.exports = centerModel;
