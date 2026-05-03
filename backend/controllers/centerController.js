const centerModel = require("../models/centerModel");

const centerController = {
// Apply for coaching center - multipart form
  applyForCenter: async (req, res) => {
    try {
      const {
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
      } = req.body;

      const user_id = req.user.user_id;
      const coaching_admin_id = user_id;

      // Check if user already has pending/active application
      const existingApp = await centerModel.checkExistingApplication(user_id);
      if (existingApp) {
        return res.status(400).json({
          success: false,
          message: "You already have a pending or active application",
        });
      }

      const owner_photo = req.files?.owner_photo?.[0]?.path;
      const nid_front = req.files?.nid_front?.[0]?.path;
      const nid_back = req.files?.nid_back?.[0]?.path;

      if (!owner_photo || !nid_front || !nid_back) {
        return res.status(400).json({
          success: false,
          message: "All three photos are required",
        });
      }

      const centerId = await centerModel.createApplication({
        user_id,
        coaching_admin_id,
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
        owner_photo,
        nid_front,
        nid_back,
      });

      res.status(201).json({
        success: true,
        message: "Center application submitted successfully",
        data: { coaching_center_id: centerId },
      });
    } catch (error) {
      console.error('Apply center error:', error);
      res.status(500).json({
        success: false,
        message: error.message.includes('photo') ? error.message : "Server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get my application (coaching admin)
  getMyApplication: async (req, res) => {
    try {
      const app = await centerModel.getMyApplicationByUserId(req.user.user_id);
      if (!app) {
        return res.status(404).json({
          success: false,
          message: "No application found",
        });
      }
      res.status(200).json({
        success: true,
        data: app,
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
      const { status, rejection_reason } = req.body;
      const center = await centerModel.getCenterById(centerId);

      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Center not found",
        });
      }

      await centerModel.updateCenterStatus(centerId, status, rejection_reason);
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
