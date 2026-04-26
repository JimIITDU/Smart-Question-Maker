const db = require('../config/db');

const academicModel = {

  // ==================
  // COURSE OPERATIONS
  // ==================

  createCourse: async (courseData) => {
    const {
      coaching_center_id,
      course_title,
      course_description,
      duration,
      fee,
    } = courseData;

    const [result] = await db.query(
      `INSERT INTO course 
       (coaching_center_id, course_title, course_description, duration, fee) 
       VALUES (?, ?, ?, ?, ?)`,
      [coaching_center_id, course_title, course_description, duration, fee]
    );
    return result.insertId;
  },

  getAllCourses: async (coaching_center_id) => {
    const [rows] = await db.query(
      `SELECT * FROM course 
       WHERE coaching_center_id = ?`,
      [coaching_center_id]
    );
    return rows;
  },

  getCourseById: async (course_id) => {
    const [rows] = await db.query(
      `SELECT * FROM course 
       WHERE course_id = ?`,
      [course_id]
    );
    return rows[0];
  },

  updateCourse: async (course_id, courseData) => {
    const {
      course_title,
      course_description,
      duration,
      fee,
    } = courseData;

    await db.query(
      `UPDATE course 
       SET course_title = ?, course_description = ?, 
       duration = ?, fee = ?
       WHERE course_id = ?`,
      [course_title, course_description, duration, fee, course_id]
    );
  },

  deleteCourse: async (course_id) => {
    await db.query(
      `DELETE FROM course WHERE course_id = ?`,
      [course_id]
    );
  },

  // ==================
  // BATCH OPERATIONS
  // ==================

  createBatch: async (batchData) => {
    const {
      course_id,
      coaching_center_id,
      batch_name,
      batch_code,
      start_date,
      end_date,
      batch_type,
      class_shift,
      max_students,
    } = batchData;

    const [result] = await db.query(
      `INSERT INTO batch 
       (course_id, coaching_center_id, batch_name, batch_code, 
       start_date, end_date, batch_type, class_shift, max_students) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_id, coaching_center_id, batch_name, batch_code,
       start_date, end_date, batch_type, class_shift, max_students]
    );
    return result.insertId;
  },

  getAllBatches: async (coaching_center_id) => {
    const [rows] = await db.query(
      `SELECT batch.*, course.course_title 
       FROM batch
       JOIN course ON batch.course_id = course.course_id
       WHERE batch.coaching_center_id = ?`,
      [coaching_center_id]
    );
    return rows;
  },

  getBatchById: async (batch_id) => {
    const [rows] = await db.query(
      `SELECT batch.*, course.course_title 
       FROM batch
       JOIN course ON batch.course_id = course.course_id
       WHERE batch.batch_id = ?`,
      [batch_id]
    );
    return rows[0];
  },

  updateBatch: async (batch_id, batchData) => {
    const {
      batch_name,
      batch_code,
      start_date,
      end_date,
      batch_type,
      class_shift,
      max_students,
      status,
    } = batchData;

    await db.query(
      `UPDATE batch 
       SET batch_name = ?, batch_code = ?,
       start_date = ?, end_date = ?,
       batch_type = ?, class_shift = ?,
       max_students = ?, status = ?
       WHERE batch_id = ?`,
      [batch_name, batch_code, start_date, end_date,
       batch_type, class_shift, max_students, status, batch_id]
    );
  },

  deleteBatch: async (batch_id) => {
    await db.query(
      `DELETE FROM batch WHERE batch_id = ?`,
      [batch_id]
    );
  },

  // ==================
  // SUBJECT OPERATIONS
  // ==================

  createSubject: async (subjectData) => {
    const {
      course_id,
      coaching_center_id,
      teacher_user_id,
      subject_name,
      subject_code,
    } = subjectData;

    const [result] = await db.query(
      `INSERT INTO subjects 
       (course_id, coaching_center_id, teacher_user_id, 
       subject_name, subject_code) 
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, coaching_center_id, teacher_user_id,
       subject_name, subject_code]
    );
    return result.insertId;
  },

  getAllSubjects: async (coaching_center_id) => {
    const [rows] = await db.query(
      `SELECT subjects.*, course.course_title,
       users.name as teacher_name
       FROM subjects
       JOIN course ON subjects.course_id = course.course_id
       LEFT JOIN users ON subjects.teacher_user_id = users.user_id
       WHERE subjects.coaching_center_id = ?`,
      [coaching_center_id]
    );
    return rows;
  },

  getSubjectById: async (subject_id) => {
    const [rows] = await db.query(
      `SELECT subjects.*, course.course_title,
       users.name as teacher_name
       FROM subjects
       JOIN course ON subjects.course_id = course.course_id
       LEFT JOIN users ON subjects.teacher_user_id = users.user_id
       WHERE subjects.subject_id = ?`,
      [subject_id]
    );
    return rows[0];
  },

  updateSubject: async (subject_id, subjectData) => {
    const {
      subject_name,
      subject_code,
      teacher_user_id,
    } = subjectData;

    await db.query(
      `UPDATE subjects 
       SET subject_name = ?, subject_code = ?,
       teacher_user_id = ?
       WHERE subject_id = ?`,
      [subject_name, subject_code, teacher_user_id, subject_id]
    );
  },

  deleteSubject: async (subject_id) => {
    await db.query(
      `DELETE FROM subjects WHERE subject_id = ?`,
      [subject_id]
    );
  },

  // =====================
  // ENROLLMENT OPERATIONS
  // =====================

  enrollStudent: async (batch_id, user_id) => {
    await db.query(
      `UPDATE users 
       SET coaching_center_id = (
         SELECT coaching_center_id 
         FROM batch 
         WHERE batch_id = ?
       )
       WHERE user_id = ?`,
      [batch_id, user_id]
    );

    await db.query(
      `UPDATE batch 
       SET current_students = current_students + 1
       WHERE batch_id = ?`,
      [batch_id]
    );
  },

  getStudentsInBatch: async (batch_id) => {
    const [rows] = await db.query(
      `SELECT users.user_id, users.name, 
       users.email, users.phone
       FROM users
       JOIN batch ON users.coaching_center_id = batch.coaching_center_id
       WHERE batch.batch_id = ? 
       AND users.role_id = 5`,
      [batch_id]
    );
    return rows;
  },

};

module.exports = academicModel;