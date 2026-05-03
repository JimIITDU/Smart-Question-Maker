const express = require("express");
const router = express.Router();
const centerController = require("../controllers/centerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Role IDs from database:
// 1 = super_admin
// 2 = coaching_admin
// 3 = teacher
// 4 = staff
// 5 = student
// 6 = parent

// Coaching admin applies for center
router.post(
  "/apply",
  authMiddleware,
  roleMiddleware(2),
  centerController.applyForCenter,
);

// Super admin gets all centers
router.get(
  "/all",
  authMiddleware,
  roleMiddleware(1),
  centerController.getAllCenters,
);

// Get my center (coaching admin)
router.get(
  "/my-center",
  authMiddleware,
  roleMiddleware(2),
  centerController.getMyCenter,
);

// Get my subscription (coaching admin)
router.get(
  "/my-subscription",
  authMiddleware,
  roleMiddleware(2),
  centerController.getMySubscription,
);

// Get dashboard stats - optimized endpoint (coaching admin)
router.get(
  "/dashboard-stats",
  authMiddleware,
  roleMiddleware(2),
  centerController.getDashboardStats,
);

// Upgrade subscription (coaching admin)
router.post(
  "/upgrade-subscription",
  authMiddleware,
  roleMiddleware(2),
  centerController.upgradeSubscription,
);

// Get center by ID

router.get("/:id", authMiddleware, centerController.getCenterById);

// Super admin approves center
router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(1),
  centerController.approveCenter,
);

// Super admin rejects center
router.put(
  "/reject/:id",
  authMiddleware,
  roleMiddleware(1),
  centerController.rejectCenter,
);

// Super admin suspends center
router.put(
  "/suspend/:id",
  authMiddleware,
  roleMiddleware(1),
  centerController.suspendCenter,
);

// Super admin status update
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(1),
  centerController.updateCenterStatus,
);

// Super admin subscription assign
router.patch(
  "/:id/subscription",
  authMiddleware,
  roleMiddleware(1),
  centerController.assignCenterSubscription,
);

// Coaching admin updates center
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(2),
  centerController.updateCenter,
);

module.exports = router;
