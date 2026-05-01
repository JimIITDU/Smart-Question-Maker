const teacherModel = require('../models/teacherModel');
const centerModel = require('../models/centerModel');
const academicModel = require('../models/academicModel');

const teacherController = {

  // ==============================
  // TEACHER APPLICATIONS
  // ==============================

  applyToCenter: async (req, res) => {
    try {
      const {
        coaching_center_id,
        subjects_specialization,
        experience_years,
        bio,
        expected_salary,
      } = req.body;

      // Validate center exists
      const center = await centerModel.getCenterById(coaching_center_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'Coaching center not found',
        });
      }

      // Check if already has pending application
      const hasPending = await teacherModel.hasPendingApplication(
        coaching_center_id,
        req.user.user_id
      );
      if (hasPending) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending application for this center',
        });
      }

      const applicationId = await teacherModel.applyToCenter({
        coaching_center_id,
        teacher_user_id: req.user.user_id,
        subjects_specialization,
        experience_years,
        bio,
        expected_salary,
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: { application_id: applicationId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getMyApplications: async (req, res) => {
    try {
      const applications = await teacherModel.getApplicationsByTeacher(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getCenterApplications: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'You do not have a coaching center',
        });
      }

      const { status } = req.query;
      const applications = await teacherModel.getApplicationsByCenter(
        center.coaching_center_id,
        status || null
      );

      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  approveApplication: async (req, res) => {
    try {
      const application = await teacherModel.getApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      // Verify admin owns the center
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center || center.coaching_center_id !== application.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not your center.',
        });
      }

      await teacherModel.updateApplicationStatus(
        req.params.id,
        'approved',
        req.user.user_id
      );

      res.status(200).json({
        success: true,
        message: 'Teacher application approved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  rejectApplication: async (req, res) => {
    try {
      const application = await teacherModel.getApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found',
        });
      }

      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center || center.coaching_center_id !== application.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not your center.',
        });
      }

      await teacherModel.updateApplicationStatus(
        req.params.id,
        'rejected',
        req.user.user_id
      );

      res.status(200).json({
        success: true,
        message: 'Teacher application rejected successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // ==============================
  // TEACHER COURSE ASSIGNMENTS
  // ==============================

  assignTeacherToCourse: async (req, res) => {
    try {
      const { teacher_id, course_id, subject_id } = req.body;

      // Verify admin owns the course
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'You do not have a coaching center',
        });
      }

      const course = await academicModel.getCourseById(course_id);
      if (!course || course.coaching_center_id !== center.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not your course.',
        });
      }

      const assignmentId = await teacherModel.assignTeacherToCourse({
        teacher_id,
        course_id,
        subject_id,
        assigned_by: req.user.user_id,
      });

      res.status(201).json({
        success: true,
        message: 'Teacher assigned to course successfully',
        data: { assignment_id: assignmentId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getMyAssignments: async (req, res) => {
    try {
      const assignments = await teacherModel.getAssignmentsByTeacher(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getCourseAssignments: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'You do not have a coaching center',
        });
      }

      const course = await academicModel.getCourseById(req.params.courseId);
      if (!course || course.coaching_center_id !== center.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Not your course.',
        });
      }

      const assignments = await teacherModel.getAssignmentsByCourse(
        req.params.courseId
      );
      res.status(200).json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  removeAssignment: async (req, res) => {
    try {
      const assignment = await teacherModel.getAssignmentById(req.params.id);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
      }

      const center = await centerModel.getCenterByUserId(req.user.user_id);
      const course = await academicModel.getCourseById(assignment.course_id);
      if (!center || !course || course.coaching_center_id !== center.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied.',
        });
      }

      await teacherModel.removeAssignment(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Teacher removed from course successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getAvailableTeachers: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: 'You do not have a coaching center',
        });
      }

      const teachers = await teacherModel.getAvailableTeachers(
        center.coaching_center_id
      );
      res.status(200).json({
        success: true,
        count: teachers.length,
        data: teachers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

};

module.exports = teacherController;
