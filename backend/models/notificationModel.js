const db = require('../config/db');

const notificationModel = {

  createNotification: async (notificationData) => {
    const {
      user_id,
      message,
      type,
    } = notificationData;

    const [result] = await db.query(
      `INSERT INTO notification 
       (user_id, message, type) 
       VALUES (?, ?, ?)`,
      [user_id, message, type]
    );
    return result.insertId;
  },

  // Create notification for multiple users
  createBulkNotifications: async (user_ids, message, type) => {
    for (const user_id of user_ids) {
      await db.query(
        `INSERT INTO notification 
         (user_id, message, type) 
         VALUES (?, ?, ?)`,
        [user_id, message, type]
      );
    }
  },

  // Get all notifications for a user
  getNotificationsByUserId: async (user_id) => {
    const [rows] = await db.query(
      `SELECT * FROM notification 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // Get unread notifications
  getUnreadNotifications: async (user_id) => {
    const [rows] = await db.query(
      `SELECT * FROM notification 
       WHERE user_id = ?
       AND status = 'unread'
       ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // Mark as read
  markAsRead: async (notification_id) => {
    await db.query(
      `UPDATE notification 
       SET status = 'read' 
       WHERE notification_id = ?`,
      [notification_id]
    );
  },

  // Mark all as read
  markAllAsRead: async (user_id) => {
    await db.query(
      `UPDATE notification 
       SET status = 'read' 
       WHERE user_id = ?`,
      [user_id]
    );
  },

  // Delete notification
  deleteNotification: async (notification_id) => {
    await db.query(
      `DELETE FROM notification 
       WHERE notification_id = ?`,
      [notification_id]
    );
  },

  // Get notification by ID
  getNotificationById: async (notification_id) => {
    const [rows] = await db.query(
      `SELECT * FROM notification 
       WHERE notification_id = ?`,
      [notification_id]
    );
    return rows[0];
  },

};

module.exports = notificationModel;