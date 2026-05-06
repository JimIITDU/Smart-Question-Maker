const db = require("../config/db");

const centerModel = {
  createApplication: async (data) => {
    const {
      user_id,
      center_name,
      center_type,
      established_year,
      address_division,
      address_district,
      address_upazila,
      address_full,
      center_phone,
      center_email,
      website,
      description,
      owner_name,
      owner_nid,
      owner_phone,
      coaching_admin_id
    } = data;

    // Combine address parts
    const full_location = `${address_full || ''}, ${address_upazila || ''}, ${address_district || ''}, ${address_division || ''}`.replace(/^(, |,|,)$/, '').trim();

    const result = await db.query(`INSERT INTO coaching_center (user_id, center_name, location, contact_number, email, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING coaching_center_id`, [
        user_id,
        center_name,
        full_location,
        center_phone,
        center_email
      ]);
    return result.rows[0].coaching_center_id;
  },

  checkExistingApplication: async (user_id) => {
    const result = await db.query(
      `SELECT coaching_center_id FROM coaching_center WHERE user_id = $1 AND status IN ('pending', 'active')`,
      [user_id],
    );
    return result.rows[0];
  },

  getMyApplicationByUserId: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1 AND cc.status IN ('pending', 'rejected', 'active')
ORDER BY cc.created_at DESC
       LIMIT 1`,
      [user_id],
    );
    return result.rows[0];
  },

  getAllCenters: async () => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
ORDER BY cc.created_at DESC`,
    );
    return result.rows;
  },

  getCenterById: async (id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.coaching_center_id = $1`,
      [id],
    );
    return result.rows[0];
  },

  getCenterByUserId: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, sp.price as plan_price, sp.features as plan_features
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1 AND cc.status = 'active'`,
      [user_id],
    );
    return result.rows[0];
  },

  updateCenterStatus: async (id, status, rejection_reason) => {
    const query = `UPDATE coaching_center SET status = $1${rejection_reason ? ', rejection_reason = $2' : ''} WHERE coaching_center_id = $2`;
    const params = rejection_reason ? [status, rejection_reason, id] : [status, id];
    await db.query(query, params);
  },

  updateCenter: async (id, data) => {
    const { center_name, location, contact_number, email } = data;
    await db.query(
      `UPDATE coaching_center
       SET center_name=$1, location=$2, contact_number=$3, email=$4
       WHERE coaching_center_id = $5`,
      [center_name, location, contact_number, email, id],
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
       WHERE cc.user_id = $1`,
      [user_id],
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
           access_type = CASE WHEN (SELECT price FROM subscription_plans WHERE plan_id = $1) = 0 THEN 'free'::access_type_enum ELSE 'paid'::access_type_enum END
       WHERE coaching_center_id = $2
       RETURNING *`,
      [planId, centerId],
    );
    return result.rows[0];
  },

  // Optimized count methods - using COUNT instead of SELECT * for better performance
  getCourseCount: async (coaching_center_id) => {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM course WHERE coaching_center_id = $1",
      [coaching_center_id],
    );
    return parseInt(result.rows[0].count) || 0;
  },

  getBatchCount: async (coaching_center_id) => {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM batch WHERE coaching_center_id = $1",
      [coaching_center_id],
    );
    return parseInt(result.rows[0].count) || 0;
  },

  getSubjectCount: async (coaching_center_id) => {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM subjects WHERE coaching_center_id = $1",
      [coaching_center_id],
    );
    return parseInt(result.rows[0].count) || 0;
  },

  getUnreadNotificationCount: async (user_id) => {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM notification WHERE user_id = $1 AND status = $2",
      [user_id, "unread"],
    );
    return parseInt(result.rows[0].count) || 0;
  },

  // Get all applications/history for a user (coaching admin)
  getApplicationHistory: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name 
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1 
       ORDER BY cc.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  // Get only pending and rejected applications for a user (coaching admin)
  getApplicationHistoryFiltered: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name 
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1 AND cc.status IN ('pending', 'rejected')
       ORDER BY cc.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  // Debug: Get all coaching center rows for a user, regardless of status
  getAllApplicationsRaw: async (user_id) => {
    const result = await db.query(
      `SELECT * FROM coaching_center WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  // Get all applications for a user, with editability flag for pending
  getApplicationHistoryWithEditFlag: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, (cc.status = 'pending') AS can_edit
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1
       ORDER BY cc.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  // Get only pending and rejected applications for a user (coaching admin)
getPendingAndRejectedApplications: async (user_id) => {
    const result = await db.query(
      `SELECT cc.*, sp.name as plan_name, (cc.status = 'pending') AS can_edit
       FROM coaching_center cc
       LEFT JOIN subscription_plans sp ON cc.current_plan_id = sp.plan_id
       WHERE cc.user_id = $1
       ORDER BY cc.created_at DESC`,
      [user_id]
    );
    return result.rows;
  },
};

module.exports = centerModel;

