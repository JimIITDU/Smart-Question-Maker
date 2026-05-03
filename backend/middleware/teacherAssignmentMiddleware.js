const teacherModel = require("../models/teacherModel");

/**
 * Middleware to check if a teacher is assigned to a specific course
 * Used to restrict exam/question creation to only assigned courses
 */
const verifyTeacherAssignment = (paramName = "courseId") => {
  return async (req, res, next) => {
    try {
      // Only teachers need this check
      if (req.user.role_id !== 3) {
        return next();
      }

      const courseId = req.params[paramName];
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
      }

      // Check if teacher is assigned to this course
      const isAssigned = await teacherModel.isTeacherAssignedToCourse(
        req.user.user_id,
        parseInt(courseId),
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this course. Contact admin for assignment.",
        });
      }

      next();
    } catch (error) {
      console.error("verifyTeacherAssignment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to get list of course IDs the teacher is assigned to
 * Useful for filtering queries
 */
const getTeacherAssignedCourses = async (req, res, next) => {
  try {
    if (req.user.role_id !== 3) {
      req.assignedCourseIds = null;
      return next();
    }

    const assignments = await teacherModel.getAssignmentsByTeacherId(
      req.user.user_id,
    );
    req.assignedCourseIds = assignments.map((a) => a.course_id);
    req.assignedSubjectIds = assignments.map((a) => a.subject_id);

    next();
  } catch (error) {
    console.error("getTeacherAssignedCourses error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  verifyTeacherAssignment,
  getTeacherAssignedCourses,
};
