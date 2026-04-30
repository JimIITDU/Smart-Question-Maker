const db = require('../config/db');

const questionModel = {

  createQuestion: async (data) => {
    const {
      coaching_center_id, subject_id, course_id, class_name, subject_name,
      paper, chapter, chapter_name, topic, question_text, question_type,
      difficulty, expected_answer, max_marks,
      option_text_a, option_text_b, option_text_c, option_text_d,
      correct_option, is_multiple_correct, created_by, source,
    } = data;
    const result = await db.query(
      `INSERT INTO question_bank
       (coaching_center_id, subject_id, course_id, class_name, subject_name, paper, chapter, chapter_name, topic,
        question_text, question_type, difficulty,
        expected_answer, max_marks, option_text_a, option_text_b,
        option_text_c, option_text_d, correct_option, is_multiple_correct, created_by, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING question_id`,
      [coaching_center_id, subject_id, course_id, class_name, subject_name, paper, chapter, chapter_name, topic,
       question_text, question_type, difficulty,
       expected_answer, max_marks, option_text_a, option_text_b,
       option_text_c, option_text_d, correct_option, is_multiple_correct || false, created_by, source]
    );
    return result.rows[0].question_id;
  },



  getAllQuestions: async (filters) => {
    let query = 'SELECT * FROM question_bank WHERE 1=1';
    const values = [];
    let i = 1;
    if (filters.coaching_center_id) {
      query += ` AND coaching_center_id = $${i++}`;
      values.push(filters.coaching_center_id);
    }
    if (filters.subject_id) {
      query += ` AND subject_id = $${i++}`;
      values.push(filters.subject_id);
    }
    if (filters.course_id) {
      query += ` AND course_id = $${i++}`;
      values.push(filters.course_id);
    }
    if (filters.class_name) {
      query += ` AND class_name = $${i++}`;
      values.push(filters.class_name);
    }
    if (filters.subject_name) {
      query += ` AND subject_name ILIKE $${i++}`;
      values.push(`%${filters.subject_name}%`);
    }
    if (filters.paper) {
      query += ` AND paper = $${i++}`;
      values.push(filters.paper);
    }
    if (filters.chapter) {
      query += ` AND chapter = $${i++}`;
      values.push(filters.chapter);
    }
    if (filters.chapter_name) {
      query += ` AND chapter_name ILIKE $${i++}`;
      values.push(`%${filters.chapter_name}%`);
    }
    if (filters.topic) {
      query += ` AND topic ILIKE $${i++}`;
      values.push(`%${filters.topic}%`);
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
      option_text_c, option_text_d, correct_option, is_multiple_correct,
      class_name, subject_name, paper, chapter, chapter_name, topic,
    } = data;
    await db.query(
      `UPDATE question_bank
       SET question_text=$1, question_type=$2, difficulty=$3,
           expected_answer=$4, max_marks=$5, option_text_a=$6,
           option_text_b=$7, option_text_c=$8, option_text_d=$9,
           correct_option=$10, is_multiple_correct=$11,
           class_name=$12, subject_name=$13, paper=$14, chapter=$15, chapter_name=$16, topic=$17
       WHERE question_id=$18`,
      [question_text, question_type, difficulty, expected_answer,
       max_marks, option_text_a, option_text_b,
       option_text_c, option_text_d, correct_option, is_multiple_correct || false,
       class_name, subject_name, paper, chapter, chapter_name, topic, id]
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

  getRandomQuestions: async (coaching_center_id, subject_id, difficulty, limit) => {
    let query = 'SELECT * FROM question_bank WHERE 1=1';
    const values = [];
    let i = 1;
    if (coaching_center_id) {
      query += ` AND coaching_center_id = $${i++}`;
      values.push(coaching_center_id);
    }
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
