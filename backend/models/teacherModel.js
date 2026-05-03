const db = require("../config/db");

const teacherModel = {
  // ==============================
  // TEACHER APPLICATIONS
  // ==============================

  applyToCenter: async (data) => {
    const {
      coaching_center_id,
      teacher_user_id,
      subjects_specialization,
      experience_years,
      bio,
      expected_salary,
    } = data;
    const result = await db.query(
      `INSERT INTO teacher_applications
       (coaching_center_id, teacher_user_id, subjects_specialization,
        experience_years, bio, expected_salary)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING application_id`,
      [
        coaching_center_id,
        teacher_user_id,
        subjects_specialization,
        experience_years,
        bio,
        expected_salary,
      ],
    );
    return result.rows[0].application_id;
  },

  getApplicationById: async (application_id) => {
    const result = await db.query(
      `SELECT ta.*,
        t.name as teacher_name, t.email as teacher_email, t.phone as teacher_phone,
        r.name as reviewer_name
       FROM teacher_applications ta
       JOIN users t ON ta.teacher_user_id = t.user_id
       LEFT JOIN users r ON ta.reviewed_by = r.user_id
       WHERE ta.application_id = $1`,
      [application_id],
    );
    return result.rows[0];
  },

  getApplicationsByCenter: async (coaching_center_id, statusFilter = null) => {
    let query = `
      SELECT ta.*,
        t.name as teacher_name, t.email as teacher_email, t.phone as teacher_phone,
        t.profile_image as teacher_profile_image,
        r.name as reviewer_name
      FROM teacher_applications ta
      JOIN users t ON ta.teacher_user_id = t.user_id
      LEFT JOIN users r ON ta.reviewed_by = r.user_id
      WHERE ta.coaching_center_id = $1
    `;
    const params = [coaching_center_id];
    if (statusFilter) {
      query += ` AND ta.status = $2`;
      params.push(statusFilter);
    }
    query += ` ORDER BY ta.applied_at DESC`;
    const result = await db.query(query, params);
    return result.rows;
  },

  getApplicationsByTeacher: async (teacher_user_id) => {
    const result = await db.query(
      `SELECT ta.*,
        cc.center_name, cc.location, cc.status as center_status
       FROM teacher_applications ta
       JOIN coaching_center cc ON ta.coaching_center_id = cc.coaching_center_id
       WHERE ta.teacher_user_id = $1
       ORDER BY ta.applied_at DESC`,
      [teacher_user_id],
    );
    return result.rows;
  },

  updateApplicationStatus: async (application_id, status, reviewed_by) => {
    await db.query(
      `UPDATE teacher_applications
       SET status = $1, reviewed_at = NOW(), reviewed_by = $2
       WHERE application_id = $3`,
      [status, reviewed_by, application_id],
    );
  },

  hasPendingApplication: async (coaching_center_id, teacher_user_id) => {
    const result = await db.query(
      `SELECT application_id FROM teacher_applications
       WHERE coaching_center_id = $1 AND teacher_user_id = $2 AND status = 'pending'`,
      [coaching_center_id, teacher_user_id],
    );
    return result.rows.length > 0;
  },

  // ==============================
  // TEACHER COURSE ASSIGNMENTS
  // ==============================

  assignTeacherToCourse: async (data) => {
    const { teacher_id, course_id, subject_id, assigned_by } = data;
    const result = await db.query(
      `INSERT INTO teacher_course_assignments
       (teacher_id, course_id, subject_id, assigned_by)
       VALUES ($1,$2,$3,$4)
       RETURNING assignment_id`,
      [teacher_id, course_id, subject_id || null, assigned_by],
    );
    return result.rows[0].assignment_id;
  },

  getAssignmentsByTeacher: async (teacher_id) => {
    const result = await db.query(
      `SELECT tca.*,
        c.course_title, c.course_description, c.status as course_status,
        s.subject_name, s.subject_code,
        cc.center_name
       FROM teacher_course_assignments tca
       JOIN course c ON tca.course_id = c.course_id
       LEFT JOIN subjects s ON tca.subject_id = s.subject_id
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE tca.teacher_id = $1 AND tca.status = 'active'
       ORDER BY tca.assigned_at DESC`,
      [teacher_id],
    );
    return result.rows;
  },

  getAssignmentsByCourse: async (course_id) => {
    const result = await db.query(
      `SELECT tca.*,
        u.name as teacher_name, u.email as teacher_email, u.phone as teacher_phone,
        u.profile_image as teacher_profile_image,
        s.subject_name, s.subject_code
       FROM teacher_course_assignments tca
       JOIN users u ON tca.teacher_id = u.user_id
       LEFT JOIN subjects s ON tca.subject_id = s.subject_id
       WHERE tca.course_id = $1 AND tca.status = 'active'
       ORDER BY tca.assigned_at DESC`,
      [course_id],
    );
    return result.rows;
  },

  getAssignmentById: async (assignment_id) => {
    const result = await db.query(
      `SELECT * FROM teacher_course_assignments WHERE assignment_id = $1`,
      [assignment_id],
    );
    return result.rows[0];
  },

  removeAssignment: async (assignment_id) => {
    await db.query(
      `UPDATE teacher_course_assignments SET status = 'inactive' WHERE assignment_id = $1`,
      [assignment_id],
    );
  },

  // Check if teacher is assigned to a specific course (for authorization)
  isTeacherAssignedToCourse: async (teacher_id, course_id) => {
    const result = await db.query(
      `SELECT assignment_id FROM teacher_course_assignments
       WHERE teacher_id = $1 AND course_id = $2 AND status = 'active'`,
      [teacher_id, course_id],
    );
    return result.rows.length > 0;
  },

  // Check if teacher is assigned to a specific subject within a course
  isTeacherAssignedToSubject: async (teacher_id, course_id, subject_id) => {
    const result = await db.query(
      `SELECT assignment_id FROM teacher_course_assignments
       WHERE teacher_id = $1 AND course_id = $2
       AND (subject_id = $3 OR subject_id IS NULL)
       AND status = 'active'`,
      [teacher_id, course_id, subject_id],
    );
    return result.rows.length > 0;
  },

  // Get teachers available for assignment at a center (approved teachers without active application)
  getAvailableTeachers: async (coaching_center_id) => {
    const result = await db.query(
      `SELECT DISTINCT u.user_id, u.name, u.email, u.phone, u.profile_image,
        u.subject_specialization, u.experience, u.bio
       FROM users u
       JOIN teacher_applications ta ON u.user_id = ta.teacher_user_id
       WHERE ta.coaching_center_id = $1
       AND ta.status = 'approved'
       AND u.role_id = 3
       AND u.status = 'active'
       ORDER BY u.name`,
      [coaching_center_id],
    );
    return result.rows;
  },
};

module.exports = teacherModel;
