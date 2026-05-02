const db = require('../config/db');

const courseEnrollmentModel = {

  // ==============================
  // BROWSE COURSES
  // ==============================
  // active + public/open courses, JOIN coaching_center for center_name, 
  // count teachers from teacher_course_assignments

  browseCourses: async (filters = {}) => {
    const { search = '', feeFilter = '', enrollmentType = '' } = filters;
    
    let conditions = [
      "c.status = 'active'",
      "(c.end_date IS NULL OR c.end_date >= CURRENT_DATE)",
      "c.is_public = true"
    ];
    let params = [];
    let paramIndex = 1;

    if (feeFilter === 'free') {
      conditions.push(`c.fee = 0 OR c.fee IS NULL`);
    } else if (feeFilter === 'paid') {
      conditions.push(`c.fee > 0`);
    }

    if (enrollmentType === 'open') {
      conditions.push(`c.enrollment_type = 'open'`);
    } else if (enrollmentType === 'private') {
      conditions.push(`c.enrollment_type = 'private'`);
    }

    if (search) {
      conditions.push(`(c.course_title ILIKE $${paramIndex} OR c.course_description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const query = `
      SELECT c.*,
        cc.center_name,
        COUNT(DISTINCT tca.teacher_id) as teacher_count
      FROM course c
      JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
      LEFT JOIN teacher_course_assignments tca ON c.course_id = tca.course_id AND tca.status = 'active'
      WHERE ${whereClause}
      GROUP BY c.course_id, cc.center_name
      ORDER BY c.created_at DESC
    `;

    const result = await db.query(query, params);
    return result.rows;
  },

  // ==============================
  // ENROLL STUDENT
  // ==============================
  // check duplicate, if fee=0 set status=active+paid+expires_at=end_date, 
  // if fee>0 set pending_payment, return requires_payment boolean

  enrollStudent: async (student_id, course_id) => {
    // Check for duplicate enrollment
    const existingCheck = await db.query(
      `SELECT * FROM course_enrollments 
       WHERE student_id = $1 AND course_id = $2 
       AND status IN ('active', 'pending')`,
      [student_id, course_id]
    );

    if (existingCheck.rows.length > 0) {
      return { 
        error: 'Already enrolled or has pending enrollment',
        existingEnrollment: existingCheck.rows[0]
      };
    }

    // Get course details
    const courseResult = await db.query(
      `SELECT c.*, cc.coaching_center_id 
       FROM course c 
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE c.course_id = $1`,
      [course_id]
    );

    if (courseResult.rows.length === 0) {
      return { error: 'Course not found' };
    }

    const course = courseResult.rows[0];

    if (course.fee === 0 || course.fee === null || course.fee === undefined) {
      // Free course - auto activate
      const expiresAt = course.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const result = await db.query(
        `INSERT INTO course_enrollments 
         (student_id, course_id, coaching_center_id, status, payment_status, enrolled_at, expires_at, amount_paid)
         VALUES ($1, $2, $3, 'active', 'paid', NOW(), $4, 0)
         RETURNING *`,
        [student_id, course_id, course.coaching_center_id, expiresAt]
      );

      return {
        enrollment: result.rows[0],
        requires_payment: false
      };
    } else {
      // Paid course - pending payment
      const result = await db.query(
        `INSERT INTO course_enrollments 
         (student_id, course_id, coaching_center_id, status, payment_status, enrolled_at, amount_paid)
         VALUES ($1, $2, $3, 'pending', 'unpaid', NOW(), $4)
         RETURNING *`,
        [student_id, course_id, course.coaching_center_id, course.fee]
      );

      return {
        enrollment: result.rows[0],
        requires_payment: true,
        fee: course.fee
      };
    }
  },

  // ==============================
  // CONFIRM PAYMENT
  // ==============================
  // set active+paid+expires_at+amount_paid

  confirmPayment: async (student_id, course_id, amount_paid) => {
    const courseResult = await db.query(
      `SELECT end_date FROM course WHERE course_id = $1`,
      [course_id]
    );

    const expiresAt = courseResult.rows[0]?.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.query(
      `UPDATE course_enrollments
       SET status = 'active',
           payment_status = 'paid',
           paid_at = NOW(),
           expires_at = $1,
           amount_paid = $2
       WHERE student_id = $3 AND course_id = $4`,
      [expiresAt, amount_paid, student_id, course_id]
    );

    const result = await db.query(
      `SELECT * FROM course_enrollments 
       WHERE student_id = $1 AND course_id = $2`,
      [student_id, course_id]
    );

    return result.rows[0];
  },

  // ==============================
  // GET MY COURSES
  // ==============================
  // active enrollments, JOIN course+coaching_center, include days_remaining

  getMyCourses: async (student_id) => {
    const result = await db.query(
      `SELECT ce.*,
        c.course_title, 
        c.course_description, 
        c.fee,
        c.start_date, 
        c.end_date, 
        c.enrollment_type,
        c.duration,
        c.status as course_status,
        cc.center_name,
        cc.coaching_center_id,
        EXTRACT(DAY FROM (ce.expires_at - NOW())) as days_remaining
       FROM course_enrollments ce
       JOIN course c ON ce.course_id = c.course_id
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE ce.student_id = $1
       AND ce.status = 'active'
       AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
       ORDER BY ce.enrolled_at DESC`,
      [student_id]
    );
    return result.rows;
  },

  // ==============================
  // GET COURSE DETAIL
  // ==============================
  // course info + center + teachers array + exams by type

  getCourseDetail: async (course_id, student_id = null) => {
    // Get course and center info
    const courseResult = await db.query(
      `SELECT c.*, cc.center_name, cc.coaching_center_id
       FROM course c
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE c.course_id = $1`,
      [course_id]
    );

    if (courseResult.rows.length === 0) {
      return null;
    }

    const course = courseResult.rows[0];

    // Get teachers
    const teachersResult = await db.query(
      `SELECT u.user_id, u.name, u.email, u.profile_image, u.subject_specialization
       FROM teacher_course_assignments tca
       JOIN users u ON tca.teacher_id = u.user_id
       WHERE tca.course_id = $1 AND tca.status = 'active'`,
      [course_id]
    );

    // Get exams by type
    const examsResult = await db.query(
      `SELECT * FROM quiz_exam
       WHERE course_id = $1
       ORDER BY created_at DESC`,
      [course_id]
    );

    // Separate exams by type
    const scheduled = examsResult.rows.filter(e => e.exam_type === 'scheduled');
    const liveQuiz = examsResult.rows.filter(e => e.exam_type === 'live_quiz');
    const practice = examsResult.rows.filter(e => e.exam_type === 'practice');

    // Check enrollment if student_id provided
    let enrollment = null;
    if (student_id) {
      const enrollmentResult = await db.query(
        `SELECT * FROM course_enrollments
         WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
        [student_id, course_id]
      );
      enrollment = enrollmentResult.rows[0] || null;
    }

    return {
      ...course,
      teachers: teachersResult.rows,
      exams: {
        scheduled,
        live_quiz: liveQuiz,
        practice
      },
      enrollment
    };
  },

  // ==============================
  // CHECK ENROLLMENT
  // ==============================
  // return enrollment or null

  checkEnrollment: async (student_id, course_id) => {
    const result = await db.query(
      `SELECT * FROM course_enrollments
       WHERE student_id = $1 AND course_id = $2
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [student_id, course_id]
    );
    return result.rows[0] || null;
  },

  // ==============================
  // ADMIN: GET COURSES
  // ==============================

  getAdminCourses: async (coaching_center_id) => {
    const result = await db.query(
      `SELECT c.*,
        cc.center_name,
        (SELECT COUNT(*) FROM course_enrollments ce
         WHERE ce.course_id = c.course_id AND ce.status = 'active') as enrollment_count,
        (SELECT COUNT(*) FROM teacher_course_assignments tca
         WHERE tca.course_id = c.course_id AND tca.status = 'active') as teacher_count
       FROM course c
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE c.coaching_center_id = $1
       ORDER BY c.created_at DESC`,
      [coaching_center_id]
    );
    return result.rows;
  },

  // ==============================
  // ADMIN: CREATE COURSE
  // ==============================

  createCourse: async (data, coaching_center_id) => {
    const {
      course_title,
      course_description,
      duration,
      fee,
      start_date,
      end_date,
      enrollment_type,
      status,
      is_public
    } = data;

    const result = await db.query(
      `INSERT INTO course 
       (coaching_center_id, course_title, course_description, duration, fee,
        start_date, end_date, enrollment_type, status, is_public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
       RETURNING *`,
      [coaching_center_id, course_title, course_description, duration, fee || 0,
       start_date, end_date, enrollment_type || 'open', status || 'active', is_public !== false]
    );
    return result.rows[0];
  },

  // ==============================
  // ADMIN: UPDATE COURSE
  // ==============================

  updateCourse: async (course_id, data, coaching_center_id) => {
    const {
      course_title,
      course_description,
      duration,
      fee,
      start_date,
      end_date,
      enrollment_type,
      status,
      is_public
    } = data;

    await db.query(
      `UPDATE course
       SET course_title = $1,
           course_description = $2,
           duration = $3,
           fee = $4,
           start_date = $5,
           end_date = $6,
           enrollment_type = $7,
           status = $8,
           is_public = $9,
           updated_at = NOW()
       WHERE course_id = $10 AND coaching_center_id = $11`,
      [course_title, course_description, duration, fee,
       start_date, end_date, enrollment_type, status, is_public !== false, course_id, coaching_center_id]
    );

    const result = await db.query(
      `SELECT * FROM course WHERE course_id = $1`,
      [course_id]
    );
    return result.rows[0];
  },

  // ==============================
  // ADMIN: GET COURSE STUDENTS
  // ==============================

  getCourseStudents: async (course_id, coaching_center_id) => {
    const result = await db.query(
      `SELECT ce.*,
        u.name as student_name,
        u.email as student_email,
        u.phone as student_phone,
        u.roll_number,
        u.class,
        u.profile_image
       FROM course_enrollments ce
       JOIN users u ON ce.student_id = u.user_id
       WHERE ce.course_id = $1
       AND ce.coaching_center_id = $2
       ORDER BY ce.enrolled_at DESC`,
      [course_id, coaching_center_id]
    );
    return result.rows;
  },

  // ==============================
  // GET COURSE EXAMS
  // ==============================

  getCourseExams: async (course_id) => {
    const result = await db.query(
      `SELECT * FROM quiz_exam
       WHERE course_id = $1
       ORDER BY start_time DESC`,
      [course_id]
    );
    return result.rows;
  },

  // ==============================
  // LEGACY: GET ENROLLMENT BY ID
  // ==============================

  getEnrollmentById: async (enrollment_id) => {
    const result = await db.query(
      `SELECT ce.*,
        c.course_title, c.course_description, c.fee,
        c.start_date, c.end_date, c.enrollment_type,
        s.name as student_name, s.email as student_email
       FROM course_enrollments ce
       JOIN course c ON ce.course_id = c.course_id
       JOIN users s ON ce.student_id = s.user_id
       WHERE ce.enrollment_id = $1`,
      [enrollment_id]
    );
    return result.rows[0];
  },

  // ==============================
  // LEGACY: CHECK DUPLICATE
  // ==============================

  getEnrollmentByStudentAndCourse: async (student_id, course_id) => {
    const result = await db.query(
      `SELECT * FROM course_enrollments
       WHERE student_id = $1 AND course_id = $2`,
      [student_id, course_id]
    );
    return result.rows[0];
  },

  // ==============================
  // LEGACY: GET ALL ENROLLMENTS
  // ==============================

  getMyEnrollments: async (student_id) => {
    const result = await db.query(
      `SELECT ce.*,
        c.course_title, c.course_description, c.fee,
        c.start_date, c.end_date, c.enrollment_type, c.status as course_status,
        cc.center_name
       FROM course_enrollments ce
       JOIN course c ON ce.course_id = c.course_id
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE ce.student_id = $1
       ORDER BY ce.enrolled_at DESC`,
      [student_id]
    );
    return result.rows;
  },

  // ==============================
  // LEGACY: GET ACTIVE ENROLLMENTS
  // ==============================

  getActiveEnrollments: async (student_id) => {
    const result = await db.query(
      `SELECT ce.*,
        c.course_title, c.course_description, c.fee,
        c.start_date, c.end_date, c.enrollment_type,
        cc.center_name
       FROM course_enrollments ce
       JOIN course c ON ce.course_id = c.course_id
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE ce.student_id = $1
       AND ce.status = 'active'
       AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
       ORDER BY ce.enrolled_at DESC`,
      [student_id]
    );
    return result.rows;
  },

  // ==============================
  // LEGACY: HAS ACTIVE ENROLLMENT
  // ==============================

  hasActiveEnrollment: async (student_id, course_id) => {
    const result = await db.query(
      `SELECT enrollment_id FROM course_enrollments
       WHERE student_id = $1 AND course_id = $2
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [student_id, course_id]
    );
    return result.rows.length > 0;
  },

};

module.exports = courseEnrollmentModel;
