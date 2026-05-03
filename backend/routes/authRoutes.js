const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes (need JWT token)
router.get("/me", authMiddleware, authController.getMe);

// Update profile
router.put("/profile", authMiddleware, authController.updateProfile);

// Change password
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
