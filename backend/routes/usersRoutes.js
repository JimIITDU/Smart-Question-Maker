const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// Unified spec endpoints
router.patch(
  "/profile",
  authMiddleware,
  (req, res, next) => {
    // TEMP debug so we can confirm which payload hits the handler
    console.log("[usersRoutes] PATCH /profile req.user:", req.user);
    console.log("[usersRoutes] PATCH /profile body:", req.body);
    next();
  },
  authController.updateUserProfile,
);
router.patch(
  "/change-password",
  authMiddleware,
  authController.changeUserPassword,
);

module.exports = router;

// Backward-compatible aliases (some clients call PATCH /api/users/profile)
// NOTE: mounted at /api/users in server.js, so these map to:
// - PATCH /api/users/profile
// - PATCH /api/users/change-password
router.patch("/profile", authMiddleware, authController.updateUserProfile);
router.patch("/change-password", authMiddleware, authController.changeUserPassword);


