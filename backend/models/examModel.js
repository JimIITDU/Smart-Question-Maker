const db = require('../config/db');

const examModel = {

  createExam: async (data) => {
    const {
      subject_id, batch_id, exam_type, host_teacher_id,
      title, duration_minutes, start_time, end_time, access_code,
    } = data;
    const result = await db.query(
      `INSERT INTO quiz_exam
       (subject_id, batch_id, exam_type, host_teacher_id,
        title, duration_minutes, start_time, end_time, access_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING exam_id`,
      [subject_id, batch_id, exam_type, host_teacher_id,
       title, duration_minutes, start_time, end_time, access_code]
    );
    return result.rows[0].exam_id;
  },

  getExamById: async (id) => {
    const result = await db.query(
      'SELECT * FROM quiz_exam WHERE exam_id = $1', [id]
    );
    return result.rows[0];
  },

  getExamsByBatch: async (batch_id) => {
    const result = await db.query(
      `SELECT * FROM quiz_exam WHERE batch_id = $1
       ORDER BY start_time DESC`,
      [batch_id]
    );
    return result.rows;
  },

  updateExamStatus: async (exam_id, status) => {
    await db.query(
      'UPDATE quiz_exam SET status = $1 WHERE exam_id = $2',
      [status, exam_id]
    );
  },

  addQuestionToExam: async (exam_id, question_id) => {
    await db.query(
      `INSERT INTO exam_questions (exam_id, question_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [exam_id, question_id]
    );
  },

  getExamQuestions: async (exam_id) => {
    const result = await db.query(
      `SELECT qb.* FROM exam_questions eq
       JOIN question_bank qb ON eq.question_id = qb.question_id
       WHERE eq.exam_id = $1`,
      [exam_id]
    );
    return result.rows;
  },

  submitAnswer: async (data) => {
    const {
      exam_id, student_id, question_id,
      descriptive_answer, marks_obtained, answer_status,
    } = data;
    const result = await db.query(
      `INSERT INTO result_summary
       (exam_id, student_id, question_id, descriptive_answer,
        marks_obtained, answer_status, answered_at)
       VALUES ($1,$2,$3,$4,$5,$6, NOW())
       RETURNING result_id`,
      [exam_id, student_id, question_id, descriptive_answer,
       marks_obtained, answer_status]
    );
    return result.rows[0].result_id;
  },

  getResultByStudent: async (exam_id, student_id) => {
    const result = await db.query(
      `SELECT rs.*, qb.question_text, qb.correct_option, qb.max_marks
       FROM result_summary rs
       JOIN question_bank qb ON rs.question_id = qb.question_id
       WHERE rs.exam_id = $1 AND rs.student_id = $2`,
      [exam_id, student_id]
    );
    return result.rows;
  },

};

module.exports = examModel;