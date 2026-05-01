const courseEnrollmentModel = require('../models/courseEnrollmentModel');
const academicModel = require('../models/academicModel');
const centerModel = require('../models/centerModel');

const courseEnrollmentController = {

  // ==============================
  // STUDENT ENROLLMENT
  // ==============================

  enrollInCourse: async (req, res) => {
    try {
      const { course_id } = req.body;

      const course = await academicModel.getCourseById(course_id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (course.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'This course is not currently active',
        });
      }

      if (course.end_date && new Date(course.end_date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'This course has already ended',
        });
      }

      // Check if already enrolled
      const existing = await courseEnrollmentModel.getEnrollmentByStudentAndCourse(
        req.user.user_id,
        course_id
      );
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'You are already enrolled or have a pending enrollment for this course',
        });
      }

      // Check enrollment type
      if (course.enrollment_type === 'restricted') {
        return res.status(403).json({
          success: false,
          message: 'This course requires admin approval for enrollment',
        });
      }

      const enrollmentId = await courseEnrollmentModel.enrollStudent({
        course_id,
        student_id: req.user.user_id,
        amount_paid: course.fee || 0,
      });

      // If free course, auto-activate
      if (!course.fee || course.fee === 0) {
        await courseEnrollmentModel.activateEnrollment(
          enrollmentId,
          course.end_date
        );
        return res.status(201).json({
          success: true,
          message: 'Enrolled successfully in free course',
          data: {
            enrollment_id: enrollmentId,
            status: 'active',
            payment_required: false,
          },
        });
      }

      // Paid course - return pending, require payment confirmation
      res.status(201).json({
        success: true,
        message: 'Enrollment initiated. Please complete payment.',
        data: {
          enrollment_id: enrollmentId,
          status: 'pending',
          payment_required: true,
          amount: course.fee,
          course_title: course.course_title,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getPaymentDetails: async (req, res) => {
    try {
      const enrollment = await courseEnrollmentModel.getEnrollmentById(
        req.params.enrollmentId
      );
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if (enrollment.student_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      if (enrollment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Payment already processed',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          enrollment_id: enrollment.enrollment_id,
          course_title: enrollment.course_title,
          course_description: enrollment.course_description,
          amount: enrollment.amount_paid || enrollment.fee,
          student_name: enrollment.student_name,
          student_email: enrollment.student_email,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  confirmPayment: async (req, res) => {
    try {
      const { enrollment_id } = req.body;

      const enrollment = await courseEnrollmentModel.getEnrollmentById(enrollment_id);
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if (enrollment.student_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      if (enrollment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Payment already processed or invalid enrollment status',
        });
      }

      // MOCK PAYMENT: No real gateway integration
      // In production, replace this with actual payment gateway verification
      await courseEnrollmentModel.confirmPayment(
        enrollment_id,
        enrollment.end_date
      );

      res.status(200).json({
        success: true,
        message: 'Payment successful. Enrollment activated.',
        data: {
          enrollment_id,
          status: 'active',
          paid_at: new Date().toISOString(),
          transaction_id: `MOCK_TXN_${Date.now()}`,
          amount_paid: enrollment.amount_paid || enrollment.fee,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getMyEnrollments: async (req, res) => {
    try {
      const enrollments = await courseEnrollmentModel.getMyEnrollments(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getMyActiveEnrollments: async (req, res) => {
    try {
      const enrollments = await courseEnrollmentModel.getActiveEnrollments(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
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
  // ADMIN / TEACHER VIEWS
  // ==============================

  getCourseStudents: async (req, res) => {
    try {
      const course = await academicModel.getCourseById(req.params.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Allow admin of the center or assigned teacher
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      const isAdmin = center && center.coaching_center_id === course.coaching_center_id;

      if (!isAdmin && req.user.role_id === 3) {
        // Check if teacher is assigned to this course
        const teacherModel = require('../models/teacherModel');
        const isAssigned = await teacherModel.isTeacherAssignedToCourse(
          req.user.user_id,
          req.params.courseId
        );
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not assigned to this course.',
          });
        }
      } else if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      const students = await courseEnrollmentModel.getCourseStudents(
        req.params.courseId
      );
      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
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
  // BROWSE COURSES (STUDENT)
  // ==============================

  browseCourses: async (req, res) => {
    try {
      const { coaching_center_id } = req.query;

      if (coaching_center_id) {
        const courses = await courseEnrollmentModel.getAvailableCourses(
          parseInt(coaching_center_id),
          req.user.user_id
        );
        return res.status(200).json({
          success: true,
          count: courses.length,
          data: courses,
        });
      }

      // Get all available courses across centers
      const courses = await courseEnrollmentModel.getAllAvailableCoursesForStudent(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
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

module.exports = courseEnrollmentController;
