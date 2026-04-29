const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

// Teacher creates exam
router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  examController.createExam
);

// Get all exams
router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3, 5),
  examController.getAllExams
);

// Get exam by ID
router.get(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  examController.getExamById
);

// Get exam questions
router.get(
  '/:id/questions',
  authMiddleware,
  tenantMiddleware,
  examController.getExamQuestions
);

// Start exam (teacher)
router.put(
  '/:id/start',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  examController.startExam
);

// Join exam by access code (student)
router.post(
  '/join',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(5),
  examController.joinExam
);

// Submit exam (student)
router.post(
  '/:id/submit',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(5),
  examController.submitExam
);

// Get results (student)
router.get(
  '/:id/results',
  authMiddleware,
  tenantMiddleware,
  examController.getResults
);

// End exam (teacher)
router.put(
  '/:id/end',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  examController.endExam
);

// Evaluate written answers with LLM (teacher)
router.post(
  '/:id/evaluate-written',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  examController.evaluateWritten
);

// Get all results for an exam (teacher)
router.get(
  '/:id/all-results',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(2, 3),
  examController.getAllResults
);

module.exports = router;
