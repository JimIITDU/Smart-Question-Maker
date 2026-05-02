const courseEnrollmentModel = require('../models/courseEnrollmentModel');

const courseEnrollmentController = {

  // ==============================
  // BROWSE COURSES (PUBLIC)
  // ==============================

  browseCourses: async (req, res) => {
    try {
      const { search, fee_filter, enrollment_type } = req.query;
      
      const filters = {
        search: search || '',
        feeFilter: fee_filter || '',
        enrollmentType: enrollment_type || ''
      };

      const courses = await courseEnrollmentModel.browseCourses(filters);

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('browseCourses error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // ENROLL IN COURSE
  // ==============================

  enrollInCourse: async (req, res) => {
    try {
      const { course_id } = req.params;
      const student_id = req.user.user_id;

      const result = await courseEnrollmentModel.enrollStudent(
        student_id,
        parseInt(course_id)
      );

      if (result.error) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      if (result.requires_payment) {
        // Navigate to payment page
        return res.status(201).json({
          success: true,
          message: 'Enrollment initiated. Please complete payment.',
          data: {
            enrollment_id: result.enrollment.enrollment_id,
            course_id: parseInt(course_id),
            status: 'pending',
            requires_payment: true,
            fee: result.fee
          }
        });
      }

      // Free course - enrolled successfully
      res.status(201).json({
        success: true,
        message: 'Enrolled successfully in free course',
        data: {
          enrollment_id: result.enrollment.enrollment_id,
          course_id: parseInt(course_id),
          status: 'active',
          requires_payment: false
        }
      });
    } catch (error) {
      console.error('enrollInCourse error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // CONFIRM PAYMENT
  // ==============================

  confirmPayment: async (req, res) => {
    try {
      const { course_id } = req.params;
      const student_id = req.user.user_id;
      const { amount_paid } = req.body;

      const enrollment = await courseEnrollmentModel.confirmPayment(
        student_id,
        parseInt(course_id),
        amount_paid || 0
      );

      res.status(200).json({
        success: true,
        message: 'Payment successful. Enrollment activated.',
        data: {
          enrollment_id: enrollment.enrollment_id,
          status: 'active',
          paid_at: enrollment.paid_at,
          amount_paid: enrollment.amount_paid
        }
      });
    } catch (error) {
      console.error('confirmPayment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // GET MY COURSES
  // ==============================

  getMyCourses: async (req, res) => {
    try {
      const student_id = req.user.user_id;

      const courses = await courseEnrollmentModel.getMyCourses(student_id);

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('getMyCourses error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // GET COURSE DETAIL
  // ==============================

  getCourseDetail: async (req, res) => {
    try {
      const { course_id } = req.params;
      const student_id = req.user?.user_id || null;

      const course = await courseEnrollmentModel.getCourseDetail(
        parseInt(course_id),
        student_id
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('getCourseDetail error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // CHECK ENROLLMENT
  // ==============================

  checkEnrollment: async (req, res) => {
    try {
      const { course_id } = req.params;
      const student_id = req.user.user_id;

      const enrollment = await courseEnrollmentModel.checkEnrollment(
        student_id,
        parseInt(course_id)
      );

      res.status(200).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('checkEnrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // GET COURSE EXAMS
  // ==============================

  getCourseExams: async (req, res) => {
    try {
      const { course_id } = req.params;

      const exams = await courseEnrollmentModel.getCourseExams(parseInt(course_id));

      res.status(200).json({
        success: true,
        data: exams,
        count: exams.length
      });
    } catch (error) {
      console.error('getCourseExams error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // ADMIN: GET COURSES
  // ==============================

  getAdminCourses: async (req, res) => {
    try {
      const coaching_center_id = req.user.coaching_center_id || req.tenant?.coaching_center_id;

      if (!coaching_center_id) {
        return res.status(400).json({
          success: false,
          message: 'Coaching center not found'
        });
      }

      const courses = await courseEnrollmentModel.getAdminCourses(coaching_center_id);

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('getAdminCourses error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // ADMIN: CREATE COURSE
  // ==============================

  createCourse: async (req, res) => {
    try {
      const coaching_center_id = req.user.coaching_center_id || req.tenant?.coaching_center_id;

      if (!coaching_center_id) {
        return res.status(400).json({
          success: false,
          message: 'Coaching center not found'
        });
      }

      const course = await courseEnrollmentModel.createCourse(
        req.body,
        coaching_center_id
      );

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('createCourse error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // ADMIN: UPDATE COURSE
  // ==============================

  updateCourse: async (req, res) => {
    try {
      const { course_id } = req.params;
      const coaching_center_id = req.user.coaching_center_id || req.tenant?.coaching_center_id;

      if (!coaching_center_id) {
        return res.status(400).json({
          success: false,
          message: 'Coaching center not found'
        });
      }

      const course = await courseEnrollmentModel.updateCourse(
        parseInt(course_id),
        req.body,
        coaching_center_id
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
      });
    } catch (error) {
      console.error('updateCourse error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // ADMIN: GET COURSE STUDENTS
  // ==============================

  getCourseStudents: async (req, res) => {
    try {
      const { course_id } = req.params;
      const coaching_center_id = req.user.coaching_center_id || req.tenant?.coaching_center_id;

      if (!coaching_center_id) {
        return res.status(400).json({
          success: false,
          message: 'Coaching center not found'
        });
      }

      const students = await courseEnrollmentModel.getCourseStudents(
        parseInt(course_id),
        coaching_center_id
      );

      res.status(200).json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('getCourseStudents error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // LEGACY: GET PAYMENT DETAILS
  // ==============================

  getPaymentDetails: async (req, res) => {
    try {
      const { enrollmentId } = req.params;

      const enrollment = await courseEnrollmentModel.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (enrollment.student_id !== req.user.user_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        data: enrollment
      });
    } catch (error) {
      console.error('getPaymentDetails error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // LEGACY: GET MY ENROLLMENTS
  // ==============================

  getMyEnrollments: async (req, res) => {
    try {
      const enrollments = await courseEnrollmentModel.getMyEnrollments(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
      });
    } catch (error) {
      console.error('getMyEnrollments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // LEGACY: GET MY ACTIVE ENROLLMENTS
  // ==============================

  getMyActiveEnrollments: async (req, res) => {
    try {
      const enrollments = await courseEnrollmentModel.getActiveEnrollments(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
      });
    } catch (error) {
      console.error('getMyActiveEnrollments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  // ==============================
  // LEGACY: GET COURSE STUDENTS (SHARED)
  // ==============================

  getCourseStudentsLegacy: async (req, res) => {
    try {
      const { courseId } = req.params;
      const academicModel = require('../models/academicModel');
      const centerModel = require('../models/centerModel');

      const course = await academicModel.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const center = await centerModel.getCenterByUserId(req.user.user_id);
      const isAdmin = center && center.coaching_center_id === course.coaching_center_id;

      if (!isAdmin && req.user.role_id === 3) {
        const teacherModel = require('../models/teacherModel');
        const isAssigned = await teacherModel.isTeacherAssignedToCourse(
          req.user.user_id,
          courseId
        );
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not assigned to this course.'
          });
        }
      } else if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const students = await courseEnrollmentModel.getCourseStudents(
        courseId,
        course.coaching_center_id
      );
      res.status(200).json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (error) {
      console.error('getCourseStudentsLegacy error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

};

module.exports = courseEnrollmentController;
