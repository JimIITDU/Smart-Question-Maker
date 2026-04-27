const db = require('../config/db');

const academicModel = {

  // COURSES
  createCourse: async (data) => {
    const { coaching_center_id, course_title, course_description, duration, fee } = data;
    const result = await db.query(
      `INSERT INTO course
       (coaching_center_id, course_title, course_description, duration, fee)
       VALUES ($1,$2,$3,$4,$5) RETURNING course_id`,
      [coaching_center_id, course_title, course_description, duration, fee]
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
    const { course_title, course_description, duration, fee } = data;
    await db.query(
      `UPDATE course
       SET course_title=$1, course_description=$2, duration=$3, fee=$4
       WHERE course_id=$5`,
      [course_title, course_description, duration, fee, id]
    );
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