const db = require("../config/db");
const teacherModel = require('../models/teacherModel');

const teacherAssignmentController = {
  // GET /api/courses/:courseId/assignments - Get course teachers
  getCourseAssignments: async (req, res) => {
    try {
      const { courseId } = req.params;
      const assignments = await teacherModel.getAssignmentsByCourse(courseId);
      res.json({ success: true, data: assignments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/teachers/assignments - Assign teacher to course
  assignTeacherToCourse: async (req, res) => {
    try {
      const coaching_center_id = req.user.coaching_center_id;
      const data = { ...req.body, assigned_by: req.user.user_id };
      
      // Verify course belongs to center
      const courseCheck = await db.query(
        'SELECT course_id FROM course WHERE course_id = $1 AND coaching_center_id = $2',
        [data.course_id, coaching_center_id]
      );
      if (courseCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Course not found' });
      }

      const assignmentId = await teacherModel.assignTeacherToCourse(data);
      res.status(201).json({ success: true, data: { assignment_id: assignmentId } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // PUT /api/teachers/assignments/:id/remove - Remove assignment
  removeAssignment: async (req, res) => {
    try {
      const assignment_id = req.params.id;
      await teacherModel.removeAssignment(assignment_id);
      res.json({ success: true, message: 'Assignment removed' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/teachers/available - Get approved teachers for center
  getAvailableTeachers: async (req, res) => {
    try {
      const coaching_center_id = req.user.coaching_center_id;
      const teachers = await teacherModel.getAvailableTeachers(coaching_center_id);
      res.json({ success: true, data: teachers });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = teacherAssignmentController;

