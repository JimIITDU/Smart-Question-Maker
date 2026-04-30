const db = require('../config/db');

const subscriptionPlanModel = {

  // Get all subscription plans
  getAllPlans: async () => {
    const result = await db.query(
      'SELECT * FROM subscription_plans ORDER BY price ASC'
    );
    return result.rows;
  },

  // Get active plans only
  getActivePlans: async () => {
    const result = await db.query(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC'
    );
    return result.rows;
  },

  // Get plan by ID
  getPlanById: async (planId) => {
    const result = await db.query(
      'SELECT * FROM subscription_plans WHERE plan_id = $1',
      [planId]
    );
    return result.rows[0];
  },

  // Create new subscription plan
  createPlan: async (data) => {
    const {
      name,
      price,
      features,
      max_students,
      max_courses,
      max_exams,
      ai_questions_limit,
      support_level,
    } = data;

    const result = await db.query(
      `INSERT INTO subscription_plans 
       (name, price, features, max_students, max_courses, max_exams, ai_questions_limit, support_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, price, features, max_students, max_courses, max_exams, ai_questions_limit, support_level]
    );
    return result.rows[0];
  },

  // Update subscription plan
  updatePlan: async (planId, data) => {
    const {
      name,
      price,
      features,
      max_students,
      max_courses,
      max_exams,
      ai_questions_limit,
      support_level,
      is_active,
    } = data;

    const result = await db.query(
      `UPDATE subscription_plans 
       SET name = $1, price = $2, features = $3, max_students = $4, 
           max_courses = $5, max_exams = $6, ai_questions_limit = $7, 
           support_level = $8, is_active = $9
       WHERE plan_id = $10
       RETURNING *`,
      [name, price, features, max_students, max_courses, max_exams, ai_questions_limit, support_level, is_active, planId]
    );
    return result.rows[0];
  },

  // Delete subscription plan
  deletePlan: async (planId) => {
    await db.query(
      'DELETE FROM subscription_plans WHERE plan_id = $1',
      [planId]
    );
  },

  // Toggle plan active status
  togglePlanStatus: async (planId, isActive) => {
    const result = await db.query(
      'UPDATE subscription_plans SET is_active = $1 WHERE plan_id = $2 RETURNING *',
      [isActive, planId]
    );
    return result.rows[0];
  },

};

module.exports = subscriptionPlanModel;
