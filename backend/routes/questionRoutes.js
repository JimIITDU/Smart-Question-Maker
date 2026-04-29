const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// Role IDs:
// 1 = super_admin
// 2 = coaching_admin
// 3 = teacher
// 4 = staff
// 5 = student

// Create question (teacher only)
router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.createQuestion
);

// Bulk create questions
router.post(
  '/bulk',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.bulkCreateQuestions
);

// Get random questions
router.get(
  '/random',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.getRandomQuestions
);

// Get all questions with filters
router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.getAllQuestions
);

// Get single question
router.get(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  questionController.getQuestionById
);

// Update question
router.put(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.updateQuestion
);

// Delete question
router.delete(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.deleteQuestion
);

// AI Generate questions (teacher/coaching admin)
router.post(
  '/ai-generate',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  questionController.aiGenerate
);

module.exports = router;
