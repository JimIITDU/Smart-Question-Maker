const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Teacher creates exam
router.post(
  '/',
  authMiddleware,
  roleMiddleware(2, 3),
  examController.createExam
);

// Get all exams
router.get(
  '/',
  authMiddleware,
  roleMiddleware(2, 3),
  examController.getAllExams
);

// Get exam by ID
router.get(
  '/:id',
  authMiddleware,
  examController.getExamById
);

// Get exam questions
router.get(
  '/:id/questions',
  authMiddleware,
  examController.getExamQuestions
);

// Start exam (teacher)
router.put(
  '/:id/start',
  authMiddleware,
  roleMiddleware(2, 3),
  examController.startExam
);

// Join exam by access code (student)
router.post(
  '/join',
  authMiddleware,
  roleMiddleware(5),
  examController.joinExam
);

// Submit exam (student)
router.post(
  '/:id/submit',
  authMiddleware,
  roleMiddleware(5),
  examController.submitExam
);

// Get results (student)
router.get(
  '/:id/results',
  authMiddleware,
  examController.getResults
);

// End exam (teacher)
router.put(
  '/:id/end',
  authMiddleware,
  roleMiddleware(2, 3),
  examController.endExam
);

module.exports = router;