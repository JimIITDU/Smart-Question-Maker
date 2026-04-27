const db = require('../config/db');

const questionModel = {

  createQuestion: async (data) => {
    const {
      subject_id, course_id, question_text, question_type,
      difficulty, expected_answer, max_marks,
      option_text_a, option_text_b, option_text_c, option_text_d,
      correct_option, created_by, source,
    } = data;
    const result = await db.query(
      `INSERT INTO question_bank
       (subject_id, course_id, question_text, question_type, difficulty,
        expected_answer, max_marks, option_text_a, option_text_b,
        option_text_c, option_text_d, correct_option, created_by, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING question_id`,
      [subject_id, course_id, question_text, question_type, difficulty,
       expected_answer, max_marks, option_text_a, option_text_b,
       option_text_c, option_text_d, correct_option, created_by, source]
    );
    return result.rows[0].question_id;
  },

  getAllQuestions: async (filters) => {
    let query = 'SELECT * FROM question_bank WHERE 1=1';
    const values = [];
    let i = 1;
    if (filters.subject_id) {
      query += ` AND subject_id = $${i++}`;
      values.push(filters.subject_id);
    }
    if (filters.course_id) {
      query += ` AND course_id = $${i++}`;
      values.push(filters.course_id);
    }
    if (filters.difficulty) {
      query += ` AND difficulty = $${i++}`;
      values.push(filters.difficulty);
    }
    if (filters.question_type) {
      query += ` AND question_type = $${i++}`;
      values.push(filters.question_type);
    }
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, values);
    return result.rows;
  },

  getQuestionById: async (id) => {
    const result = await db.query(
      'SELECT * FROM question_bank WHERE question_id = $1', [id]
    );
    return result.rows[0];
  },

  updateQuestion: async (id, data) => {
    const {
      question_text, question_type, difficulty, expected_answer,
      max_marks, option_text_a, option_text_b,
      option_text_c, option_text_d, correct_option,
    } = data;
    await db.query(
      `UPDATE question_bank
       SET question_text=$1, question_type=$2, difficulty=$3,
           expected_answer=$4, max_marks=$5, option_text_a=$6,
           option_text_b=$7, option_text_c=$8, option_text_d=$9,
           correct_option=$10
       WHERE question_id=$11`,
      [question_text, question_type, difficulty, expected_answer,
       max_marks, option_text_a, option_text_b,
       option_text_c, option_text_d, correct_option, id]
    );
  },

  deleteQuestion: async (id) => {
    await db.query(
      'DELETE FROM question_bank WHERE question_id = $1', [id]
    );
  },

  bulkCreateQuestions: async (questions) => {
    const ids = [];
    for (const q of questions) {
      const id = await questionModel.createQuestion(q);
      ids.push(id);
    }
    return ids;
  },

  getRandomQuestions: async (subject_id, difficulty, limit) => {
    let query = 'SELECT * FROM question_bank WHERE 1=1';
    const values = [];
    let i = 1;
    if (subject_id) {
      query += ` AND subject_id = $${i++}`;
      values.push(subject_id);
    }
    if (difficulty) {
      query += ` AND difficulty = $${i++}`;
      values.push(difficulty);
    }
    query += ` ORDER BY RANDOM() LIMIT $${i}`;
    values.push(limit);
    const result = await db.query(query, values);
    return result.rows;
  },

};

module.exports = questionModel;