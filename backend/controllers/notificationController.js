const notificationModel = require("../models/notificationModel");

const notificationController = {
  // Create notification
  createNotification: async (req, res) => {
    try {
      const { user_id, message, type } = req.body;

      const notificationId = await notificationModel.createNotification({
        user_id,
        message,
        type,
      });

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: { notification_id: notificationId },
      });
    } catch (error) {
      console.error("createNotification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Broadcast notification to multiple users

  broadcastNotification: async (req, res) => {
    try {
      const { user_ids, message, type } = req.body;

      if (!user_ids || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No users provided",
        });
      }

      await notificationModel.createBulkNotifications(user_ids, message, type);

      res.status(201).json({
        success: true,
        message: `Notification sent to ${user_ids.length} users`,
      });
    } catch (error) {
      console.error("broadcastNotification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get my notifications

  getMyNotifications: async (req, res) => {
    try {
      const notifications = await notificationModel.getNotificationsByUserId(
        req.user.user_id,
      );

      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      console.error("getMyNotifications error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Get unread notifications

  getUnreadNotifications: async (req, res) => {
    try {
      const notifications = await notificationModel.getUnreadNotifications(
        req.user.user_id,
      );

      res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      console.error("getUnreadNotifications error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Mark as read

  markAsRead: async (req, res) => {
    try {
      const notification = await notificationModel.getNotificationById(
        req.params.id,
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      await notificationModel.markAsRead(req.params.id);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      console.error("markAsRead error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Mark all as read

  markAllAsRead: async (req, res) => {
    try {
      await notificationModel.markAllAsRead(req.user.user_id);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("markAllAsRead error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // Delete notification

  deleteNotification: async (req, res) => {
    try {
      const notification = await notificationModel.getNotificationById(
        req.params.id,
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      await notificationModel.deleteNotification(req.params.id);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("deleteNotification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
};

module.exports = notificationController;
