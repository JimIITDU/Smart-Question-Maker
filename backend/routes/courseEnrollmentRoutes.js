const express = require('express');
const router = express.Router();
const courseEnrollmentController = require('../controllers/courseEnrollmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Role IDs: 1=super_admin, 2=coaching_admin, 3=teacher, 4=staff, 5=student

// Student enrolls in a course
router.post(
  '/courses/:courseId/enroll',
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.enrollInCourse
);

// Get payment details for an enrollment (before confirmation)
router.get(
  '/payment/:enrollmentId',
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getPaymentDetails
);

// Confirm mock payment and activate enrollment
router.post(
  '/confirm-payment',
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.confirmPayment
);

// Student views all their enrollments
router.get(
  '/my-enrollments',
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getMyEnrollments
);

// Student views active enrollments only
router.get(
  '/my-active-enrollments',
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getMyActiveEnrollments
);

// Admin/Teacher views students enrolled in a course
router.get(
  '/courses/:courseId/students',
  authMiddleware,
  roleMiddleware(2, 3),
  courseEnrollmentController.getCourseStudents
);

// Student browses available courses
router.get(
  '/browse',
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.browseCourses
);

module.exports = router;
