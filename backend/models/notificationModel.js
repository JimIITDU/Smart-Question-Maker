const db = require('../config/db');

const notificationModel = {

  createNotification: async (data) => {
    const { user_id, message, type } = data;
    const result = await db.query(
      `INSERT INTO notification (user_id, message, type)
       VALUES ($1, $2, $3) RETURNING notification_id`,
      [user_id, message, type]
    );
    return result.rows[0].notification_id;
  },

  createBulkNotifications: async (user_ids, message, type) => {
    for (const user_id of user_ids) {
      await db.query(
        `INSERT INTO notification (user_id, message, type)
         VALUES ($1, $2, $3)`,
        [user_id, message, type]
      );
    }
  },

  getNotificationsByUserId: async (user_id) => {
    const result = await db.query(
      `SELECT * FROM notification WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  getUnreadNotifications: async (user_id) => {
    const result = await db.query(
      `SELECT * FROM notification
       WHERE user_id = $1 AND status = 'unread'
       ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  getNotificationById: async (id) => {
    const result = await db.query(
      `SELECT * FROM notification WHERE notification_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  markAsRead: async (id) => {
    await db.query(
      `UPDATE notification SET status = 'read'
       WHERE notification_id = $1`,
      [id]
    );
  },

  markAllAsRead: async (user_id) => {
    await db.query(
      `UPDATE notification SET status = 'read'
       WHERE user_id = $1`,
      [user_id]
    );
  },

  deleteNotification: async (id) => {
    await db.query(
      `DELETE FROM notification WHERE notification_id = $1`,
      [id]
    );
  },

};

module.exports = notificationModel;