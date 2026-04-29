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

  getAllExams: async (teacher_id) => {
    const result = await db.query(
      `SELECT q.*, s.subject_name, b.batch_name 
       FROM quiz_exam q
       LEFT JOIN subjects s ON q.subject_id = s.subject_id
       LEFT JOIN batch b ON q.batch_id = b.batch_id
       WHERE q.host_teacher_id = $1
       ORDER BY q.created_at DESC`,
      [teacher_id]
    );
    return result.rows;
  },


  getAllExamsForStudent: async () => {
    const result = await db.query(
      `SELECT q.*, s.subject_name, b.batch_name 
       FROM quiz_exam q
       LEFT JOIN subjects s ON q.subject_id = s.subject_id
       LEFT JOIN batch b ON q.batch_id = b.batch_id
       WHERE q.status != 'completed'
       ORDER BY q.start_time ASC`
    );
    return result.rows;
  },


  getExamById: async (id) => {
    const result = await db.query(
      `SELECT q.*, s.subject_name, b.batch_name 
       FROM quiz_exam q
       LEFT JOIN subjects s ON q.subject_id = s.subject_id
       LEFT JOIN batch b ON q.batch_id = b.batch_id
       WHERE q.exam_id = $1`, [id]
    );
    return result.rows[0];
  },


  getExamByAccessCode: async (access_code) => {
    const result = await db.query(
      `SELECT q.*, s.subject_name, b.batch_name 
       FROM quiz_exam q
       LEFT JOIN subjects s ON q.subject_id = s.subject_id
       LEFT JOIN batch b ON q.batch_id = b.batch_id
       WHERE q.access_code = $1`,
      [access_code]
    );
    return result.rows[0];
  },


  updateExamStatus: async (exam_id, status) => {
    await db.query(
      `UPDATE quiz_exam SET status = $1 WHERE exam_id = $2`,
      [status, exam_id]
    );
  },

  addQuestionsToExam: async (exam_id, question_ids) => {
    for (const question_id of question_ids) {
      await db.query(
        `INSERT INTO exam_questions (exam_id, question_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [exam_id, question_id]
      );
    }
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

  checkAlreadySubmitted: async (exam_id, student_id) => {
    const result = await db.query(
      `SELECT COUNT(*) FROM result_summary
       WHERE exam_id = $1 AND student_id = $2
       AND answer_status = 'submitted'`,
      [exam_id, student_id]
    );
    return parseInt(result.rows[0].count) > 0;
  },

  submitAnswer: async (data) => {
    const {
      exam_id, student_id, question_id,
      descriptive_answer, marks_obtained, evaluated_by,
    } = data;
    const result = await db.query(
      `INSERT INTO result_summary
       (exam_id, student_id, question_id, descriptive_answer,
        marks_obtained, evaluated_by, answer_status, answered_at)
       VALUES ($1,$2,$3,$4,$5,$6,'submitted', NOW())
       RETURNING result_id`,
      [exam_id, student_id, question_id, descriptive_answer,
       marks_obtained, evaluated_by]
    );
    return result.rows[0].result_id;
  },

  getStudentResults: async (exam_id, student_id) => {
    const result = await db.query(
      `SELECT rs.*, qb.question_text, qb.correct_option, qb.max_marks
       FROM result_summary rs
       JOIN question_bank qb ON rs.question_id = qb.question_id
       WHERE rs.exam_id = $1 AND rs.student_id = $2`,
      [exam_id, student_id]
    );
    return result.rows;
  },

  calculateTotalMarks: async (exam_id, student_id) => {
    const result = await db.query(
      `SELECT
         SUM(qb.max_marks) as total_marks,
         SUM(rs.marks_obtained) as obtained_marks
       FROM result_summary rs
       JOIN question_bank qb ON rs.question_id = qb.question_id
       WHERE rs.exam_id = $1 AND rs.student_id = $2`,
      [exam_id, student_id]
    );
    return result.rows[0];
  },

};

module.exports = examModel;
