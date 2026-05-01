const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Role IDs:
// 1 = super_admin
// 2 = coaching_admin
// 3 = teacher
// 4 = staff
// 5 = student

// ============
// COURSE ROUTES
// ============
router.post(
  '/courses',
  authMiddleware,
  roleMiddleware(2),
  academicController.createCourse
);

router.get(
  '/courses',
  authMiddleware,
  roleMiddleware(2, 3, 4),
  academicController.getAllCourses
);

router.get(
  '/courses/:id',
  authMiddleware,
  academicController.getCourseById
);

router.get(
  '/courses/active',
  authMiddleware,
  roleMiddleware(2, 3, 4),
  academicController.getActiveCourses
);

router.get(
  '/courses/teacher',
  authMiddleware,
  roleMiddleware(3),
  academicController.getCoursesForTeacher
);

router.get(
  '/courses/:id/details',
  authMiddleware,
  academicController.getCourseWithDetails
);

router.put(
  '/courses/:id',
  authMiddleware,
  roleMiddleware(2),
  academicController.updateCourse
);

router.delete(
  '/courses/:id',
  authMiddleware,
  roleMiddleware(2),
  academicController.deleteCourse
);

// ============
// BATCH ROUTES
// ============
router.post(
  '/batches',
  authMiddleware,
  roleMiddleware(2),
  academicController.createBatch
);

router.get(
  '/batches',
  authMiddleware,
  roleMiddleware(2, 3, 4),
  academicController.getAllBatches
);

router.get(
  '/batches/:id',
  authMiddleware,
  academicController.getBatchById
);

router.put(
  '/batches/:id',
  authMiddleware,
  roleMiddleware(2, 4),
  academicController.updateBatch
);

router.delete(
  '/batches/:id',
  authMiddleware,
  roleMiddleware(2),
  academicController.deleteBatch
);

// ==============
// SUBJECT ROUTES
// ==============
router.post(
  '/subjects',
  authMiddleware,
  roleMiddleware(2),
  academicController.createSubject
);

router.get(
  '/subjects',
  authMiddleware,
  roleMiddleware(2, 3, 4),
  academicController.getAllSubjects
);

router.get(
  '/subjects/:id',
  authMiddleware,
  academicController.getSubjectById
);

router.put(
  '/subjects/:id',
  authMiddleware,
  roleMiddleware(2),
  academicController.updateSubject
);

router.delete(
  '/subjects/:id',
  authMiddleware,
  roleMiddleware(2),
  academicController.deleteSubject
);

// =================
// ENROLLMENT ROUTES
// =================
router.post(
  '/enroll',
  authMiddleware,
  roleMiddleware(2, 4),
  academicController.enrollStudent
);

router.get(
  '/batches/:id/students',
  authMiddleware,
  roleMiddleware(2, 3, 4),
  academicController.getStudentsInBatch
);

module.exports = router;