const express = require('express');
const router = express.Router();
const coachingAnalyticsController = require('../controllers/coachingAnalyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/overview', authMiddleware, roleMiddleware(2), coachingAnalyticsController.getOverview);
router.get('/results', authMiddleware, roleMiddleware(2), coachingAnalyticsController.getResults);
router.get('/batches', authMiddleware, roleMiddleware(2), coachingAnalyticsController.getBatches);

module.exports = router;

