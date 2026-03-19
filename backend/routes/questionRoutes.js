const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

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
  roleMiddleware(2, 3, 5),
  questionController.createQuestion
);

// Bulk create questions
router.post(
  '/bulk',
  authMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.bulkCreateQuestions
);

// Get random questions
router.get(
  '/random',
  authMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.getRandomQuestions
);

// Get all questions with filters
router.get(
  '/',
  authMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.getAllQuestions
);

// Get single question
router.get(
  '/:id',
  authMiddleware,
  questionController.getQuestionById
);

// Update question
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.updateQuestion
);

// Delete question
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(2, 3, 5),
  questionController.deleteQuestion
);

module.exports = router;