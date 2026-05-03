const subscriptionPlanModel = require("../models/subscriptionPlanModel");

const subscriptionPlanController = {
  // Get all subscription plans (public)
  getAllPlans: async (req, res) => {
    try {
      const plans = await subscriptionPlanModel.getAllPlans();
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get active plans only (public)
  getActivePlans: async (req, res) => {
    try {
      const plans = await subscriptionPlanModel.getActivePlans();
      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get plan by ID
  getPlanById: async (req, res) => {
    try {
      const plan = await subscriptionPlanModel.getPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }
      res.status(200).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Create new plan (super admin only)
  createPlan: async (req, res) => {
    try {
      const {
        name,
        price,
        features,
        max_students,
        max_courses,
        max_exams,
        ai_questions_limit,
        support_level,
      } = req.body;

      if (!name || price === undefined) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required",
        });
      }

      const plan = await subscriptionPlanModel.createPlan({
        name,
        price,
        features: features || [],
        max_students,
        max_courses,
        max_exams,
        ai_questions_limit,
        support_level,
      });

      res.status(201).json({
        success: true,
        message: "Subscription plan created successfully",
        data: plan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Update plan (super admin only)
  updatePlan: async (req, res) => {
    try {
      const planId = req.params.id;
      const existingPlan = await subscriptionPlanModel.getPlanById(planId);

      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }

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
      } = req.body;

      const updatedPlan = await subscriptionPlanModel.updatePlan(planId, {
        name: name || existingPlan.name,
        price: price !== undefined ? price : existingPlan.price,
        features: features || existingPlan.features,
        max_students:
          max_students !== undefined ? max_students : existingPlan.max_students,
        max_courses:
          max_courses !== undefined ? max_courses : existingPlan.max_courses,
        max_exams: max_exams !== undefined ? max_exams : existingPlan.max_exams,
        ai_questions_limit:
          ai_questions_limit !== undefined
            ? ai_questions_limit
            : existingPlan.ai_questions_limit,
        support_level: support_level || existingPlan.support_level,
        is_active: is_active !== undefined ? is_active : existingPlan.is_active,
      });

      res.status(200).json({
        success: true,
        message: "Subscription plan updated successfully",
        data: updatedPlan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Delete plan (super admin only)
  deletePlan: async (req, res) => {
    try {
      const planId = req.params.id;
      const existingPlan = await subscriptionPlanModel.getPlanById(planId);

      if (!existingPlan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }

      await subscriptionPlanModel.deletePlan(planId);

      res.status(200).json({
        success: true,
        message: "Subscription plan deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Toggle plan status (super admin only)
  togglePlanStatus: async (req, res) => {
    try {
      const planId = req.params.id;
      const { is_active } = req.body;

      const plan = await subscriptionPlanModel.togglePlanStatus(
        planId,
        is_active,
      );

      res.status(200).json({
        success: true,
        message: `Plan ${is_active ? "activated" : "deactivated"} successfully`,
        data: plan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
};

module.exports = subscriptionPlanController;
