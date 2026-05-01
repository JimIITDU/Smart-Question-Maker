const db = require('../config/db');

const courseEnrollmentModel = {

  // ==============================
  // ENROLLMENTS
  // ==============================

  enrollStudent: async (data) => {
    const { course_id, student_id, amount_paid } = data;
    const result = await db.query(
      `INSERT INTO course_enrollments
       (course_id, student_id, status, amount_paid)
       VALUES ($1, $2, 'pending', $3)
       RETURNING enrollment_id`,
      [course_id, student_id, amount_paid || 0]
    );
    return result.rows[0].enrollment_id;
  },

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

  getEnrollmentByStudentAndCourse: async (student_id, course_id) => {
    const result = await db.query(
      `SELECT * FROM course_enrollments
       WHERE student_id = $1 AND course_id = $2`,
      [student_id, course_id]
    );
    return result.rows[0];
  },

  confirmPayment: async (enrollment_id, expires_at) => {
    await db.query(
      `UPDATE course_enrollments
       SET status = 'active', paid_at = NOW(), expires_at = $1
       WHERE enrollment_id = $2`,
      [expires_at, enrollment_id]
    );
  },

  // For free courses, auto-activate enrollment
  activateEnrollment: async (enrollment_id, expires_at) => {
    await db.query(
      `UPDATE course_enrollments
       SET status = 'active', enrolled_at = NOW(), expires_at = $1
       WHERE enrollment_id = $2`,
      [expires_at, enrollment_id]
    );
  },

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

  getCourseStudents: async (course_id) => {
    const result = await db.query(
      `SELECT ce.*,
        s.name as student_name, s.email as student_email,
        s.phone as student_phone, s.roll_number, s.class
       FROM course_enrollments ce
       JOIN users s ON ce.student_id = s.user_id
       WHERE ce.course_id = $1
       ORDER BY ce.enrolled_at DESC`,
      [course_id]
    );
    return result.rows;
  },

  getActiveCourseStudents: async (course_id) => {
    const result = await db.query(
      `SELECT ce.*,
        s.name as student_name, s.email as student_email,
        s.phone as student_phone, s.roll_number, s.class
       FROM course_enrollments ce
       JOIN users s ON ce.student_id = s.user_id
       WHERE ce.course_id = $1
       AND ce.status = 'active'
       AND (ce.expires_at IS NULL OR ce.expires_at > NOW())
       ORDER BY ce.enrolled_at DESC`,
      [course_id]
    );
    return result.rows;
  },

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

  getCourseEnrollmentCount: async (course_id) => {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM course_enrollments
       WHERE course_id = $1 AND status = 'active'`,
      [course_id]
    );
    return parseInt(result.rows[0].count) || 0;
  },

  // ==============================
  // COURSE BROWSING
  // ==============================

  getAvailableCourses: async (coaching_center_id, student_id = null) => {
    let query = `
      SELECT c.*,
        cc.center_name,
        COUNT(DISTINCT ce.student_id) as enrollment_count
      FROM course c
      JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
      LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id AND ce.status = 'active'
      WHERE c.coaching_center_id = $1
      AND c.status = 'active'
      AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
    `;
    const params = [coaching_center_id];

    if (student_id) {
      query += ` AND NOT EXISTS (
        SELECT 1 FROM course_enrollments ce2
        WHERE ce2.course_id = c.course_id
        AND ce2.student_id = $2
        AND ce2.status IN ('active', 'pending')
      )`;
      params.push(student_id);
    }

    query += ` GROUP BY c.course_id, cc.center_name ORDER BY c.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  },

  getAllAvailableCoursesForStudent: async (student_id) => {
    const result = await db.query(
      `SELECT c.*,
        cc.center_name,
        (SELECT COUNT(*) FROM course_enrollments ce
         WHERE ce.course_id = c.course_id AND ce.status = 'active') as enrollment_count,
        EXISTS (
          SELECT 1 FROM course_enrollments ce2
          WHERE ce2.course_id = c.course_id AND ce2.student_id = $1
          AND ce2.status IN ('active', 'pending')
        ) as is_enrolled
       FROM course c
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE c.status = 'active'
       AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
       AND c.enrollment_type = 'open'
       ORDER BY c.created_at DESC`,
      [student_id]
    );
    return result.rows;
  },

  // ==============================
  // EXPIRATION
  // ==============================

  expireOldEnrollments: async () => {
    await db.query(
      `UPDATE course_enrollments
       SET status = 'expired'
       WHERE status = 'active'
       AND expires_at IS NOT NULL
       AND expires_at < NOW()`
    );
  },

};

module.exports = courseEnrollmentModel;
