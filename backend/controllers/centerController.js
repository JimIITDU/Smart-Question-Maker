const centerModel = require("../models/centerModel");

const centerController = {
  // Apply for coaching center
  applyForCenter: async (req, res) => {
    try {
      const { center_name, location, contact_number, email, established_date } =
        req.body;

      // Check if user already has a center
      const existingCenter = await centerModel.getCenterByUserId(
        req.user.user_id,
      );
      if (existingCenter) {
        return res.status(400).json({
          success: false,
          message: "You already have a coaching center application",
        });
      }

      const centerId = await centerModel.createCenter({
        user_id: req.user.user_id,
        center_name,
        location,
        contact_number,
        email,
        established_date,
      });

      res.status(201).json({
        success: true,
        message: "Center application submitted successfully",
        data: { coaching_center_id: centerId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get all centers (super admin only)
  getAllCenters: async (req, res) => {
    try {
      const centers = await centerModel.getAllCenters();
      res.status(200).json({
        success: true,
        data: centers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get center by ID
  getCenterById: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(req.params.id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }
      res.status(200).json({
        success: true,
        data: center,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Approve center (super admin only)
  approveCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(req.params.id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      await centerModel.updateCenterStatus(req.params.id, "active");

      res.status(200).json({
        success: true,
        message: "Center approved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Reject center (super admin only)
  rejectCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(req.params.id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      await centerModel.updateCenterStatus(req.params.id, "inactive");

      res.status(200).json({
        success: true,
        message: "Center rejected successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Suspend center (super admin only)
  suspendCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(req.params.id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      await centerModel.updateCenterStatus(req.params.id, "inactive");

      res.status(200).json({
        success: true,
        message: "Center suspended successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Update center profile (coaching admin only)
  updateCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(req.params.id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      // Make sure only owner can update
      if (center.user_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Not your center.",
        });
      }

      await centerModel.updateCenter(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "Center updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get my center (coaching admin)
  getMyCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a center yet",
        });
      }
      res.status(200).json({
        success: true,
        data: center,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get my subscription (coaching admin)
  getMySubscription: async (req, res) => {
    try {
      const subscription = await centerModel.getCenterSubscription(
        req.user.user_id,
      );
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "You do not have a center yet",
        });
      }
      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Upgrade subscription (coaching admin)
  upgradeSubscription: async (req, res) => {
    try {
      const { plan_id } = req.body;

      if (!plan_id) {
        return res.status(400).json({
          success: false,
          message: "Plan ID is required",
        });
      }

      // Get the user's center
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a center yet",
        });
      }

      // Check if center is active
      if (center.status !== "active") {
        return res.status(400).json({
          success: false,
          message: "Your center must be approved before upgrading subscription",
        });
      }

      // Update the subscription
      const updatedCenter = await centerModel.updateCenterSubscription(
        center.coaching_center_id,
        plan_id,
      );

      res.status(200).json({
        success: true,
        message: "Subscription upgraded successfully",
        data: updatedCenter,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Update center status (super admin)
  updateCenterStatus: async (req, res) => {
    try {
      const centerId = req.params.id;
      const { status, reason } = req.body;
      const center = await centerModel.getCenterById(centerId);

      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      await centerModel.updateCenterStatus(centerId, status);
      console.log('Center status updated:', status); // Debug log

      res.status(200).json({
        success: true,
        message: `Center status updated to ${status}`,
      });
    } catch (error) {
      console.error('Center status update error:', error);
      res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  // Assign subscription plan to center (super admin)
  assignCenterSubscription: async (req, res) => {
    try {
      const centerId = req.params.id;
      const { plan_id } = req.body;
      const center = await centerModel.getCenterById(centerId);

      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      if (!plan_id) {
        return res.status(400).json({
          success: false,
          message: "Plan ID is required",
        });
      }

      const updatedCenter = await centerModel.updateCenterSubscription(centerId, plan_id);
      console.log('Plan assigned:', plan_id, 'to center:', centerId); // Debug

      res.status(200).json({
        success: true,
        message: "Subscription plan assigned successfully",
        data: updatedCenter,
      });
    } catch (error) {
      console.error('Assign plan error:', error);
      res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  // Get dashboard stats - truly parallel optimized endpoint
  getDashboardStats: async (req, res) => {
    try {
      // Get center with full subscription data in a single query
      const center = await centerModel.getCenterSubscription(req.user.user_id);

      // If no center, return empty stats
      if (!center) {
        return res.status(200).json({
          success: true,
          data: {
            center: null,
            subscription: null,
            stats: {
              courses: 0,
              batches: 0,
              subjects: 0,
              notifications: 0,
            },
          },
        });
      }

      // Get all stats in optimized parallel queries

      const [courses, batches, subjects, notifications] = await Promise.all([
        centerModel.getCourseCount(center.coaching_center_id),
        centerModel.getBatchCount(center.coaching_center_id),
        centerModel.getSubjectCount(center.coaching_center_id),
        centerModel.getUnreadNotificationCount(req.user.user_id),
      ]);

      res.status(200).json({
        success: true,
        data: {
          center,
          subscription: center, // subscription data is included in center object
          stats: {
            courses,
            batches,
            subjects,
            notifications,
          },
        },
      });
    } catch (error) {
      console.error("getDashboardStats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
};

module.exports = centerController;
