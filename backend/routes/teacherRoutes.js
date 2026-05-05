const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Role IDs: 1=super_admin, 2=coaching_admin, 3=teacher, 4=staff, 5=student

// Teacher applies to a coaching center
router.post(
  "/apply",
  authMiddleware,
  roleMiddleware(3),
  teacherController.applyToCenter,
);

// Teacher views their own applications
router.get(
  "/my-applications",
  authMiddleware,
  roleMiddleware(3),
  teacherController.getMyApplications,
);

// Coaching admin views applications for their center
router.get(
  "/applications",
  authMiddleware,
  roleMiddleware(2),
  teacherController.getCenterApplications,
);

// Coaching admin approves application
router.put(
  "/applications/:id/approve",
  authMiddleware,
  roleMiddleware(2),
  teacherController.approveApplication,
);

// Coaching admin rejects application
router.put(
  "/applications/:id/reject",
  authMiddleware,
  roleMiddleware(2),
  teacherController.rejectApplication,
);

// Coaching admin assigns teacher to a course
router.post(
  "/assignments",
  authMiddleware,
  roleMiddleware(2),
  teacherController.assignTeacherToCourse,
);

// Teacher views their course assignments
router.get(
  "/my-assignments",
  authMiddleware,
  roleMiddleware(3),
  teacherController.getMyAssignments,
);

// View assignments for a specific course
router.get(
  "/assignments/course/:courseId",
  authMiddleware,
  roleMiddleware(2, 3),
  teacherController.getCourseAssignments,
);

// Coaching admin removes a teacher assignment
router.put(
  "/assignments/:id/remove",
  authMiddleware,
  roleMiddleware(2),
  teacherController.removeAssignment,
);

// Coaching admin gets available approved teachers
router.get(
  "/available",
  authMiddleware,
  roleMiddleware(2),
  teacherController.getAvailableTeachers,
);

// Use consistent auth for new routes
const adminAuth = [authMiddleware, roleMiddleware(2)];
const teacherAssignmentController = require('../controllers/teacherAssignmentController');

// Teacher assignments
router.post('/assignments', adminAuth, teacherAssignmentController.assignTeacherToCourse);
router.put('/assignments/:id/remove', adminAuth, teacherAssignmentController.removeAssignment);

module.exports = router;
