const express = require("express");
const router = express.Router();
const multer = require("multer");
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Role IDs:
// 1 = super_admin
// 2 = coaching_admin
// 3 = teacher
// 4 = staff
// 5 = student

// Create question (teacher, coaching_admin, student)
router.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.createQuestion,
);

// Bulk create questions
router.post(
  "/bulk",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.bulkCreateQuestions,
);

// Get random questions
router.get(
  "/random",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.getRandomQuestions,
);

// Get all questions with filters
router.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.getAllQuestions,
);

// Get single question
router.get(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  questionController.getQuestionById,
);

// Update question
router.put(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.updateQuestion,
);

// Delete question (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.deleteQuestion,
);

// AI Generate questions (teacher/coaching admin) - with optional PDF upload
router.post(
  "/ai-generate",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  upload.single("pdf"),
  questionController.aiGenerate,
);

// Bulk update status (accept/reject AI questions)
router.patch(
  "/bulk-status",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  questionController.bulkUpdateStatus,
);

// Exam modes support
router.post(
  "/random-batch",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  questionController.randomBatch
);

router.post(
  "/check-sufficiency",
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  questionController.checkSufficiency
);

module.exports = router;

