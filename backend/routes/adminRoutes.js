const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protect all admin routes: auth + super admin (role 1)
router.use(authMiddleware, roleMiddleware(1));

// GET /api/admin/users - paginated list w/ search/filter
router.get('/users', adminController.getAdminUsers);

// GET /api/admin/centers/stats - active/pending counts
router.get('/centers/stats', adminController.getCentersStats);

// GET /api/admin/users/stats - total users
router.get('/users/stats', adminController.getUsersStats);

// PATCH /api/admin/users/:id/status - toggle active/inactive
router.patch('/users/:id/status', adminController.updateUserStatus);

// POST /api/admin/users/:id/reset-password - generate temp pwd
router.post('/users/:id/reset-password', adminController.resetUserPassword);

module.exports = router;

