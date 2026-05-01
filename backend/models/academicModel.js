const db = require('../config/db');

const academicModel = {

  // COURSES
  createCourse: async (data) => {
    const {
      coaching_center_id, course_title, course_description,
      duration, fee, start_date, end_date, enrollment_type, status
    } = data;
    const result = await db.query(
      `INSERT INTO course
       (coaching_center_id, course_title, course_description, duration, fee,
        start_date, end_date, enrollment_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING course_id`,
      [coaching_center_id, course_title, course_description, duration, fee,
       start_date, end_date, enrollment_type || 'open', status || 'active']
    );
    return result.rows[0].course_id;
  },


  getAllCourses: async (coaching_center_id) => {
    const result = await db.query(
      'SELECT * FROM course WHERE coaching_center_id = $1 ORDER BY created_at DESC',
      [coaching_center_id]
    );
    return result.rows;
  },

  getCourseById: async (id) => {
    const result = await db.query(
      'SELECT * FROM course WHERE course_id = $1', [id]
    );
    return result.rows[0];
  },

  updateCourse: async (id, data) => {
    const {
      course_title, course_description, duration, fee,
      start_date, end_date, enrollment_type, status
    } = data;
    await db.query(
      `UPDATE course
       SET course_title=$1, course_description=$2, duration=$3, fee=$4,
           start_date=$5, end_date=$6, enrollment_type=$7, status=$8
       WHERE course_id=$9`,
      [course_title, course_description, duration, fee,
       start_date, end_date, enrollment_type, status, id]
    );
  },


  getCourseWithDetails: async (id) => {
    const courseResult = await db.query(
      `SELECT c.*, cc.center_name
       FROM course c
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE c.course_id = $1`,
      [id]
    );
    const course = courseResult.rows[0];
    if (!course) return null;

    const subjectsResult = await db.query(
      `SELECT s.*, u.name as teacher_name
       FROM subjects s
       LEFT JOIN users u ON s.teacher_user_id = u.user_id
       WHERE s.course_id = $1 AND s.is_active = TRUE`,
      [id]
    );

    const teachersResult = await db.query(
      `SELECT DISTINCT tca.teacher_id, u.name as teacher_name, u.email,
        u.profile_image, u.subject_specialization
       FROM teacher_course_assignments tca
       JOIN users u ON tca.teacher_id = u.user_id
       WHERE tca.course_id = $1 AND tca.status = 'active'`,
      [id]
    );

    const enrollmentCountResult = await db.query(
      `SELECT COUNT(*) as count FROM course_enrollments
       WHERE course_id = $1 AND status = 'active'`,
      [id]
    );

    return {
      ...course,
      subjects: subjectsResult.rows,
      assigned_teachers: teachersResult.rows,
      enrollment_count: parseInt(enrollmentCountResult.rows[0].count) || 0,
    };
  },

  getCoursesForTeacher: async (teacher_id) => {
    const result = await db.query(
      `SELECT c.*, cc.center_name,
        (SELECT COUNT(*) FROM course_enrollments ce
         WHERE ce.course_id = c.course_id AND ce.status = 'active') as enrollment_count
       FROM teacher_course_assignments tca
       JOIN course c ON tca.course_id = c.course_id
       JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
       WHERE tca.teacher_id = $1 AND tca.status = 'active'
       AND c.status = 'active'
       ORDER BY c.created_at DESC`,
      [teacher_id]
    );
    return result.rows;
  },

  getActiveCourses: async (coaching_center_id) => {
    const result = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM course_enrollments ce
         WHERE ce.course_id = c.course_id AND ce.status = 'active') as enrollment_count
       FROM course c
       WHERE c.coaching_center_id = $1
       AND c.status = 'active'
       AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
       ORDER BY c.created_at DESC`,
      [coaching_center_id]
    );
    return result.rows;
  },

  deleteCourse: async (id) => {
    await db.query('DELETE FROM course WHERE course_id = $1', [id]);
  },


  // BATCHES
  createBatch: async (data) => {
    const {
      coaching_center_id, course_id, batch_name, batch_code,
      start_date, end_date, batch_type, class_shift, max_students,
    } = data;
    const result = await db.query(
      `INSERT INTO batch
       (coaching_center_id, course_id, batch_name, batch_code,
        start_date, end_date, batch_type, class_shift, max_students)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING batch_id`,
      [coaching_center_id, course_id, batch_name, batch_code,
       start_date, end_date, batch_type, class_shift, max_students]
    );
    return result.rows[0].batch_id;
  },

  getAllBatches: async (coaching_center_id) => {
    const result = await db.query(
      `SELECT b.*, c.course_title FROM batch b
       JOIN course c ON b.course_id = c.course_id
       WHERE b.coaching_center_id = $1 ORDER BY b.created_at DESC`,
      [coaching_center_id]
    );
    return result.rows;
  },

  getBatchById: async (id) => {
    const result = await db.query(
      'SELECT * FROM batch WHERE batch_id = $1', [id]
    );
    return result.rows[0];
  },

  updateBatch: async (id, data) => {
    const { batch_name, batch_code, start_date, end_date,
            batch_type, class_shift, max_students, status } = data;
    await db.query(
      `UPDATE batch
       SET batch_name=$1, batch_code=$2, start_date=$3, end_date=$4,
           batch_type=$5, class_shift=$6, max_students=$7, status=$8
       WHERE batch_id=$9`,
      [batch_name, batch_code, start_date, end_date,
       batch_type, class_shift, max_students, status, id]
    );
  },

  deleteBatch: async (id) => {
    await db.query('DELETE FROM batch WHERE batch_id = $1', [id]);
  },

  enrollStudent: async (batch_id, user_id) => {
    await db.query(
      `INSERT INTO batch_enrollment (batch_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [batch_id, user_id]
    );
    await db.query(
      `UPDATE batch SET current_students = current_students + 1
       WHERE batch_id = $1`,
      [batch_id]
    );
  },

  getStudentsInBatch: async (batch_id) => {
    const result = await db.query(
      `SELECT u.user_id, u.name, u.email, u.phone, u.roll_number
       FROM batch_enrollment be
       JOIN users u ON be.user_id = u.user_id
       WHERE be.batch_id = $1`,
      [batch_id]
    );
    return result.rows;
  },

  // SUBJECTS
  createSubject: async (data) => {
    const {
      coaching_center_id, course_id, subject_name,
      subject_code, teacher_user_id,
    } = data;
    const result = await db.query(
      `INSERT INTO subjects
       (coaching_center_id, course_id, subject_name, subject_code, teacher_user_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING subject_id`,
      [coaching_center_id, course_id, subject_name, subject_code, teacher_user_id]
    );
    return result.rows[0].subject_id;
  },

  getAllSubjects: async (coaching_center_id) => {
    const result = await db.query(
      `SELECT s.*, c.course_title FROM subjects s
       JOIN course c ON s.course_id = c.course_id
       WHERE s.coaching_center_id = $1 ORDER BY s.created_at DESC`,
      [coaching_center_id]
    );
    return result.rows;
  },

  getSubjectById: async (id) => {
    const result = await db.query(
      'SELECT * FROM subjects WHERE subject_id = $1', [id]
    );
    return result.rows[0];
  },

  updateSubject: async (id, data) => {
    const { subject_name, subject_code, teacher_user_id, is_active } = data;
    await db.query(
      `UPDATE subjects
       SET subject_name=$1, subject_code=$2,
           teacher_user_id=$3, is_active=$4
       WHERE subject_id=$5`,
      [subject_name, subject_code, teacher_user_id, is_active, id]
    );
  },

  deleteSubject: async (id) => {
    await db.query('DELETE FROM subjects WHERE subject_id = $1', [id]);
  },

};

module.exports = academicModel;
