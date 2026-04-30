const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes (no auth required)
router.get('/all', subscriptionPlanController.getAllPlans);
router.get('/active', subscriptionPlanController.getActivePlans);
router.get('/:id', subscriptionPlanController.getPlanById);

// Super admin only routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware(1),
  subscriptionPlanController.createPlan
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(1),
  subscriptionPlanController.updatePlan
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(1),
  subscriptionPlanController.deletePlan
);

router.put(
  '/:id/toggle',
  authMiddleware,
  roleMiddleware(1),
  subscriptionPlanController.togglePlanStatus
);

module.exports = router;
