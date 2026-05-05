const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const adminController = {

  // GET /api/admin/users?search=&role=&page=1
  async getAdminUsers(req, res) {
    try {
      const { search = '', role = '', page = 1 } = req.query;
      const limit = 20;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      let params = [];
      let paramIndex = 1;

      if (search) {
        whereClause += ` AND (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (role) {
        whereClause += ` AND u.role_id = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }

      const countResult = await db.query(
        `SELECT COUNT(*) as total FROM users u ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      const usersResult = await db.query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.role_id,
          u.status,
          u.created_at as joined_date,
          u.coaching_center_id,
          COALESCE(r.role_name::text, 'user') as role_name,
          cc.center_name
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN coaching_center cc ON u.coaching_center_id = cc.coaching_center_id
        ${whereClause}
        ORDER BY u.created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      res.json({
        success: true,
        data: usersResult.rows,
        pagination: {
          page: parseInt(page),
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
  },

  // GET /api/admin/centers/stats
  async getCentersStats(req, res) {
    try {
      const activeResult = await db.query(
        "SELECT COUNT(*) as count FROM coaching_center WHERE status = 'active'"
      );
      const pendingResult = await db.query(
        "SELECT COUNT(*) as count FROM coaching_center WHERE status = 'pending'"
      );

      res.json({
        success: true,
        data: {
          active: parseInt(activeResult.rows[0].count),
          pending: parseInt(pendingResult.rows[0].count)
        }
      });
    } catch (error) {
      console.error('Centers stats error:', error);
      res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
  },

  // GET /api/admin/users/stats
  async getUsersStats(req, res) {
    try {
      const result = await db.query('SELECT COUNT(*) as count FROM users');
      res.json({
        success: true,
        data: { total: parseInt(result.rows[0].count) }
      });
    } catch (error) {
      console.error('Users stats error:', error);
      res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
  },



  // POST /api/admin/users/:id/reset-password
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;

      const tempPwd = crypto.randomBytes(5).toString('hex');
      const hash = await bcrypt.hash(tempPwd, 12);

      const result = await db.query(
        'UPDATE users SET password_hash = $1 WHERE user_id = $2 RETURNING user_id',
        [hash, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        message: 'Password reset successful',
        data: { temporary_password: tempPwd }
      });
    } catch (error) {
      console.error('Reset pwd error:', error);
      res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
  }
};

module.exports = adminController;