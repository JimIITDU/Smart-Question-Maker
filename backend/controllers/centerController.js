const centerModel = require('../models/centerModel');

const centerController = {

  // Apply for coaching center
  applyForCenter: async (req, res) => {
    try {
      const {
        center_name,
        location,
        contact_number,
        email,
        established_date,
      } = req.body;

      // Check if user already has a center
      const existingCenter = await centerModel.getCenterByUserId(
        req.user.user_id
      );
      if (existingCenter) {
        return res.status(400).json({
          success: false,
          message: 'You already have a coaching center application',
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
        message: 'Center application submitted successfully',
        data: { coaching_center_id: centerId },
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
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
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get center by ID
  getCenterById: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(
        req.params.id
      );
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Center not found',
        });
      }
      res.status(200).json({
        success: true,
        data: center,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Approve center (super admin only)
  approveCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(
        req.params.id
      );
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Center not found',
        });
      }

      await centerModel.updateCenterStatus(
        req.params.id,
        'active'
      );

      res.status(200).json({
        success: true,
        message: 'Center approved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Reject center (super admin only)
  rejectCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(
        req.params.id
      );
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Center not found',
        });
      }

      await centerModel.updateCenterStatus(
        req.params.id,
        'inactive'
      );

      res.status(200).json({
        success: true,
        message: 'Center rejected successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Suspend center (super admin only)
  suspendCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(
        req.params.id
      );
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Center not found',
        });
      }

      await centerModel.updateCenterStatus(
        req.params.id,
        'inactive'
      );

      res.status(200).json({
        success: true,
        message: 'Center suspended successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Update center profile (coaching admin only)
  updateCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterById(
        req.params.id
      );
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Center not found',
        });
      }

      // Make sure only owner can update
      if (center.user_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not your center.',
        });
      }

      await centerModel.updateCenter(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Center updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get my center (coaching admin)
  getMyCenter: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(
        req.user.user_id
      );
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'You do not have a center yet',
        });
      }
      res.status(200).json({
        success: true,
        data: center,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

};

module.exports = centerController;