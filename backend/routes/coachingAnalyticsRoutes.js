const express = require('express');
const router = express.Router();
const coachingAnalyticsController = require('../controllers/coachingAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Coaching Admin - Analytics for /coaching-admin/analytics
// Returns data structure consumed by frontend/src/pages/CoachingAdmin/CoachingAnalytics.jsx
router.get(
  '/analytics',
  authMiddleware,
  roleMiddleware(2),
  coachingAnalyticsController.getAnalytics
);

// Backward-compatible endpoints (existing routes)
// NOTE: coachingAnalyticsController historically used different method names.
// Keep these routes wired to the correct controller functions.
router.get(
  '/overview',
  authMiddleware,
  roleMiddleware(2),
  coachingAnalyticsController.getDashboardStats
);
router.get(
  '/results',
  authMiddleware,
  roleMiddleware(2),
  coachingAnalyticsController.getExamPerformance
);
router.get(
  '/batches',
  authMiddleware,
  roleMiddleware(2),
  coachingAnalyticsController.getEnrollmentTrends
);

module.exports = router;


