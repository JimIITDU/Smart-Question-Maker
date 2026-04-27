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

  getNotificationsByUser: async (user_id) => {
    const result = await db.query(
      `SELECT * FROM notification WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );
    return result.rows;
  },

  markAsRead: async (notification_id) => {
    await db.query(
      `UPDATE notification SET status = 'read'
       WHERE notification_id = $1`,
      [notification_id]
    );
  },

  markAllAsRead: async (user_id) => {
    await db.query(
      `UPDATE notification SET status = 'read'
       WHERE user_id = $1`,
      [user_id]
    );
  },

};

module.exports = notificationModel;