const express = require("express");
const router = express.Router();
const courseEnrollmentController = require("../controllers/courseEnrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Role IDs: 1=super_admin, 2=coaching_admin, 3=teacher, 4=staff, 5=student

// ==================== PUBLIC ROUTES ====================

// Browse courses (public - no auth required)
router.get("/browse", courseEnrollmentController.browseCourses);

// ==================== STUDENT ROUTES (role_id = 5) ====================

// Enroll in a course
router.post(
  "/:course_id/enroll",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.enrollInCourse,
);

// Confirm payment
router.post(
  "/payment/:course_id/confirm",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.confirmPayment,
);

// Get my courses
router.get(
  "/my-courses",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getMyCourses,
);

// Get course details
router.get(
  "/:course_id/details",
  authMiddleware,
  courseEnrollmentController.getCourseDetail,
);

// Check enrollment status
router.get(
  "/:course_id/check-enrollment",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.checkEnrollment,
);

// Get course exams
router.get(
  "/:course_id/exams",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getCourseExams,
);

// ==================== ADMIN ROUTES (role_id = 2) ====================

// Get admin courses list
router.get(
  "/admin/list",
  authMiddleware,
  roleMiddleware(2),
  courseEnrollmentController.getAdminCourses,
);

// Create course
router.post(
  "/admin/create",
  authMiddleware,
  roleMiddleware(2),
  courseEnrollmentController.createCourse,
);

// Update course
router.put(
  "/admin/:course_id",
  authMiddleware,
  roleMiddleware(2),
  courseEnrollmentController.updateCourse,
);

// Get course students
router.get(
  "/admin/:course_id/students",
  authMiddleware,
  roleMiddleware(2),
  courseEnrollmentController.getCourseStudents,
);

// ==================== LEGACY ROUTES (for backward compatibility) ====================

// Get payment details for an enrollment (before confirmation)
router.get(
  "/payment/:enrollmentId",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getPaymentDetails,
);

// Student views all their enrollments
router.get(
  "/my-enrollments",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getMyEnrollments,
);

// Student views active enrollments only
router.get(
  "/my-active-enrollments",
  authMiddleware,
  roleMiddleware(5),
  courseEnrollmentController.getMyActiveEnrollments,
);

// Admin/Teacher views students enrolled in a course
router.get(
  "/courses/:courseId/students",
  authMiddleware,
  roleMiddleware(2, 3),
  courseEnrollmentController.getCourseStudentsLegacy,
);

module.exports = router;
