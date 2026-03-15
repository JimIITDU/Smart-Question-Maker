const db = require('../config/db');

const examModel = {

  createExam: async (examData) => {
    const {
      subject_id,
      batch_id,
      exam_type,
      host_teacher_id,
      start_time,
      end_time,
      access_code,
    } = examData;

    const [result] = await db.query(
      `INSERT INTO quiz_exam 
       (subject_id, batch_id, exam_type, host_teacher_id,
       start_time, end_time, access_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, batch_id, exam_type, host_teacher_id,
       start_time, end_time, access_code]
    );
    return result.insertId;
  },

  getAllExams: async (teacher_id) => {
    const [rows] = await db.query(
      `SELECT quiz_exam.*, 
       subjects.subject_name,
       batch.batch_name
       FROM quiz_exam
       JOIN subjects ON quiz_exam.subject_id = subjects.subject_id
       JOIN batch ON quiz_exam.batch_id = batch.batch_id
       WHERE quiz_exam.host_teacher_id = ?`,
      [teacher_id]
    );
    return rows;
  },

  getExamById: async (exam_id) => {
    const [rows] = await db.query(
      `SELECT quiz_exam.*, 
       subjects.subject_name,
       batch.batch_name
       FROM quiz_exam
       JOIN subjects ON quiz_exam.subject_id = subjects.subject_id
       JOIN batch ON quiz_exam.batch_id = batch.batch_id
       WHERE quiz_exam.exam_id = ?`,
      [exam_id]
    );
    return rows[0];
  },

  updateExamStatus: async (exam_id, status) => {
    await db.query(
      `UPDATE quiz_exam 
       SET status = ? 
       WHERE exam_id = ?`,
      [status, exam_id]
    );
  },

  getExamByAccessCode: async (access_code) => {
    const [rows] = await db.query(
      `SELECT * FROM quiz_exam 
       WHERE access_code = ?`,
      [access_code]
    );
    return rows[0];
  },

  // Add questions to exam
  addQuestionsToExam: async (exam_id, question_ids) => {
    for (const question_id of question_ids) {
      await db.query(
        `INSERT INTO exam_questions 
         (exam_id, question_id) 
         VALUES (?, ?)`,
        [exam_id, question_id]
      );
    }
  },

  // Get questions for exam
  getExamQuestions: async (exam_id) => {
    const [rows] = await db.query(
      `SELECT question_bank.* 
       FROM question_bank
       JOIN exam_questions 
       ON question_bank.question_id = exam_questions.question_id
       WHERE exam_questions.exam_id = ?`,
      [exam_id]
    );
    return rows;
  },

  // Submit answer
  submitAnswer: async (answerData) => {
    const {
      exam_id,
      student_id,
      question_id,
      descriptive_answer,
      marks_obtained,
      evaluated_by,
    } = answerData;

    const [result] = await db.query(
      `INSERT INTO result_summary 
       (exam_id, student_id, question_id, descriptive_answer,
       marks_obtained, evaluated_by, answer_status, answered_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'submitted', NOW())`,
      [exam_id, student_id, question_id, descriptive_answer,
       marks_obtained, evaluated_by]
    );
    return result.insertId;
  },

  // Get student results
  getStudentResults: async (exam_id, student_id) => {
    const [rows] = await db.query(
      `SELECT result_summary.*,
       question_bank.question_text,
       question_bank.correct_option,
       question_bank.question_type
       FROM result_summary
       JOIN question_bank 
       ON result_summary.question_id = question_bank.question_id
       WHERE result_summary.exam_id = ?
       AND result_summary.student_id = ?`,
      [exam_id, student_id]
    );
    return rows;
  },

  // Calculate total marks
  calculateTotalMarks: async (exam_id, student_id) => {
    const [rows] = await db.query(
      `SELECT 
       SUM(marks_obtained) as total_marks,
       COUNT(question_id) as total_questions
       FROM result_summary
       WHERE exam_id = ?
       AND student_id = ?`,
      [exam_id, student_id]
    );
    return rows[0];
  },
  // Check if already submitted
checkAlreadySubmitted: async (exam_id, student_id) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) as count 
     FROM result_summary
     WHERE exam_id = ? 
     AND student_id = ?`,
    [exam_id, student_id]
  );
  return rows[0].count > 0;
},

};

module.exports = examModel;