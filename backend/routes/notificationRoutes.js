const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Create notification (admin/teacher only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(1, 2, 3),
  notificationController.createNotification,
);

// Broadcast notification (admin only)
router.post(
  "/broadcast",
  authMiddleware,
  roleMiddleware(1, 2),
  notificationController.broadcastNotification,
);

// Get my notifications (all users)
router.get("/", authMiddleware, notificationController.getMyNotifications);

// Get unread notifications
router.get(
  "/unread",
  authMiddleware,
  notificationController.getUnreadNotifications,
);

// Mark all as read
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

// Mark single as read
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

// Delete notification
router.delete(
  "/:id",
  authMiddleware,
  notificationController.deleteNotification,
);

module.exports = router;
