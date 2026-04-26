const db = require('../config/db');

const questionModel = {

  createQuestion: async (questionData) => {
    const {
      subject_id,
      course_id,
      question_text,
      question_type,
      difficulty,
      expected_answer,
      max_marks,
      option_text_a,
      option_text_b,
      option_text_c,
      option_text_d,
      correct_option,
      created_by,
      source,
    } = questionData;

    const [result] = await db.query(
      `INSERT INTO question_bank 
       (subject_id, course_id, question_text, question_type,
       difficulty, expected_answer, max_marks, option_text_a,
       option_text_b, option_text_c, option_text_d, 
       correct_option, created_by, source) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, course_id, question_text, question_type,
       difficulty, expected_answer, max_marks, option_text_a,
       option_text_b, option_text_c, option_text_d,
       correct_option, created_by, source]
    );
    return result.insertId;
  },

  getAllQuestions: async (filters) => {
    const { subject_id, course_id, difficulty, question_type } = filters;
    
    let query = `
      SELECT question_bank.*, 
       subjects.subject_name,
       users.name as created_by_name
       FROM question_bank
       JOIN subjects ON question_bank.subject_id = subjects.subject_id
       JOIN users ON question_bank.created_by = users.user_id
       WHERE 1=1
    `;
    
    const params = [];

    if (subject_id) {
      query += ` AND question_bank.subject_id = ?`;
      params.push(subject_id);
    }
    if (course_id) {
      query += ` AND question_bank.course_id = ?`;
      params.push(course_id);
    }
    if (difficulty) {
      query += ` AND question_bank.difficulty = ?`;
      params.push(difficulty);
    }
    if (question_type) {
      query += ` AND question_bank.question_type = ?`;
      params.push(question_type);
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  getQuestionById: async (question_id) => {
    const [rows] = await db.query(
      `SELECT question_bank.*, 
       subjects.subject_name,
       users.name as created_by_name
       FROM question_bank
       JOIN subjects ON question_bank.subject_id = subjects.subject_id
       JOIN users ON question_bank.created_by = users.user_id
       WHERE question_bank.question_id = ?`,
      [question_id]
    );
    return rows[0];
  },

  updateQuestion: async (question_id, questionData) => {
    const {
      question_text,
      question_type,
      difficulty,
      expected_answer,
      max_marks,
      option_text_a,
      option_text_b,
      option_text_c,
      option_text_d,
      correct_option,
    } = questionData;

    await db.query(
      `UPDATE question_bank 
       SET question_text = ?, question_type = ?,
       difficulty = ?, expected_answer = ?,
       max_marks = ?, option_text_a = ?,
       option_text_b = ?, option_text_c = ?,
       option_text_d = ?, correct_option = ?
       WHERE question_id = ?`,
      [question_text, question_type, difficulty,
       expected_answer, max_marks, option_text_a,
       option_text_b, option_text_c, option_text_d,
       correct_option, question_id]
    );
  },

  deleteQuestion: async (question_id) => {
    await db.query(
      `DELETE FROM question_bank 
       WHERE question_id = ?`,
      [question_id]
    );
  },

  bulkCreateQuestions: async (questions) => {
    const results = [];
    for (const question of questions) {
      const id = await questionModel.createQuestion(question);
      results.push(id);
    }
    return results;
  },

  getRandomQuestions: async (subject_id, difficulty, limit) => {
    const [rows] = await db.query(
      `SELECT * FROM question_bank
       WHERE subject_id = ?
       AND difficulty = ?
       ORDER BY RAND()
       LIMIT ?`,
      [subject_id, difficulty, limit]
    );
    return rows;
  },

};

module.exports = questionModel;