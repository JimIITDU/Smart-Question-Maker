const db = require("../config/db");

const examModel = {
createExam: async (data) => {
    const {
      coaching_center_id,
      course_id,
      subject_id,
      batch_id,
      exam_type,
      host_teacher_id,
      title,
      duration_minutes,
      start_time,
      end_time,
      access_code,
      total_marks,
      pass_mark,
      instructions,
      num_sets,
      overlap_pct
    } = data;

    // ✅ SAFE STATIC COLUMNS - matches typical DB schema
    // Skip num_sets/overlap_pct if DB doesn't have them
    const result = await db.query(
      `INSERT INTO quiz_exam (
        coaching_center_id, course_id, subject_id, batch_id, 
        exam_type, host_teacher_id, title, duration_minutes,
        total_marks, negative_marks, 
        pass_mark, instructions, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'draft')
      RETURNING exam_id`,
      [
        coaching_center_id,
        course_id || null,
        subject_id || null, 
        batch_id || null,
        exam_type || 'practice',
        host_teacher_id,
        title || `Exam ${new Date().toISOString().slice(0,10)}`,
        duration_minutes || 60,
        start_time,
        end_time,
        access_code,
        total_marks || 0,
        data.negative_marks || 0,
        pass_mark || null,
        instructions || ''
      ]
    );
    
    return result.rows[0].exam_id;
  },

  /**
   * Add questions with optional multi-set support
   */
  addQuestionsToExam: async (exam_id, question_ids, num_sets = 1, overlap_pct = 0) => {
    if (!Array.isArray(question_ids) || question_ids.length === 0) return;

    // Single set (backward compatible)
    if (num_sets === 1) {
      for (const question_id of question_ids) {
        await db.query(
          `INSERT INTO exam_questions (exam_id, question_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [exam_id, question_id]
        );
      }
      return;
    }

    // Multi-set stub - full shuffle/overlap logic later
    // For now, duplicate questions for each set (0 overlap)
    for (let set_num = 1; set_num <= num_sets; set_num++) {
      for (const question_id of question_ids) {
        await db.query(
          `INSERT INTO exam_questions (exam_id, question_id, set_num)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [exam_id, question_id, set_num]
        );
      }
    }
  },


  getAllExams: async (teacher_id, coaching_center_id) => {
    let query = `
      SELECT q.*, s.subject_name, b.batch_name 
      FROM quiz_exam q
      LEFT JOIN subjects s ON q.subject_id = s.subject_id
      LEFT JOIN batch b ON q.batch_id = b.batch_id
      WHERE q.host_teacher_id = $1
    `;
    const values = [teacher_id];

    if (coaching_center_id) {
      query += ` AND q.coaching_center_id = $2`;
      values.push(coaching_center_id);
    }

    query += ` ORDER BY q.created_at DESC`;

    const result = await db.query(query, values);
    return result.rows;
  },

  getAllExamsForStudent: async (coaching_center_id) => {
    let query = `
      SELECT q.*, s.subject_name, b.batch_name 
      FROM quiz_exam q
      LEFT JOIN subjects s ON q.subject_id = s.subject_id
      LEFT JOIN batch b ON q.batch_id = b.batch_id
      WHERE q.status != 'completed'
    `;
    const values = [];

    if (coaching_center_id) {
      query += ` AND q.coaching_center_id = $1`;
      values.push(coaching_center_id);
    }

    query += ` ORDER BY q.start_time ASC`;

    const result = await db.query(query, values);
    return result.rows;
  },

  getExamById: async (id) => {
    const result = await db.query(
      `SELECT q.*, s.subject_name, b.batch_name 
       FROM quiz_exam q
       LEFT JOIN subjects s ON q.subject_id = s.subject_id
       LEFT JOIN batch b ON q.batch_id = b.batch_id
       WHERE q.exam_id = $1`,
      [id],
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
      [access_code],
    );
    return result.rows[0];
  },

  updateExamStatus: async (exam_id, status) => {
    await db.query(`UPDATE quiz_exam SET status = $1 WHERE exam_id = $2`, [
      status,
      exam_id,
    ]);
  },

  addQuestionsToExam: async (exam_id, question_ids) => {
    for (const question_id of question_ids) {
      await db.query(
        `INSERT INTO exam_questions (exam_id, question_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [exam_id, question_id],
      );
    }
  },

  getExamQuestions: async (exam_id) => {
    const result = await db.query(
      `SELECT qb.* FROM exam_questions eq
       JOIN question_bank qb ON eq.question_id = qb.question_id
       WHERE eq.exam_id = $1`,
      [exam_id],
    );
    return result.rows;
  },

  checkAlreadySubmitted: async (exam_id, student_id) => {
    const result = await db.query(
      `SELECT COUNT(*) FROM result_summary
       WHERE exam_id = $1 AND student_id = $2
       AND answer_status = 'submitted'`,
      [exam_id, student_id],
    );
    return parseInt(result.rows[0].count) > 0;
  },

  submitAnswer: async (data) => {
    const {
      coaching_center_id,
      exam_id,
      student_id,
      question_id,
      descriptive_answer,
      marks_obtained,
      evaluated_by,
    } = data;
    const result = await db.query(
      `INSERT INTO result_summary
       (coaching_center_id, exam_id, student_id, question_id, descriptive_answer,
        marks_obtained, evaluated_by, answer_status, answered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'submitted', NOW())
       RETURNING result_id`,
      [
        coaching_center_id,
        exam_id,
        student_id,
        question_id,
        descriptive_answer,
        marks_obtained,
        evaluated_by,
      ],
    );
    return result.rows[0].result_id;
  },

  getStudentResults: async (exam_id, student_id) => {
    const result = await db.query(
      `SELECT rs.*, qb.question_text, qb.correct_option, qb.max_marks
       FROM result_summary rs
       JOIN question_bank qb ON rs.question_id = qb.question_id
       WHERE rs.exam_id = $1 AND rs.student_id = $2`,
      [exam_id, student_id],
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
      [exam_id, student_id],
    );
    return result.rows[0];
  },

  evaluateResult: async (
    result_id,
    marks_obtained,
    feedback,
    confidence_score,
    evaluated_by = "llm",
  ) => {
    await db.query(
      `UPDATE result_summary
       SET marks_obtained = $1,
           feedback = $2,
           confidence_score = $3,
           evaluated_by = $4,
           evaluated_at = NOW()
       WHERE result_id = $5`,
      [marks_obtained, feedback, confidence_score, evaluated_by, result_id],
    );
  },

  getUnevaluatedResults: async (exam_id) => {
    const result = await db.query(
      `SELECT rs.*, qb.question_text, qb.expected_answer, qb.max_marks, qb.question_type
       FROM result_summary rs
       JOIN question_bank qb ON rs.question_id = qb.question_id
       WHERE rs.exam_id = $1
       AND qb.question_type = 'descriptive'
       AND (rs.evaluated_by IS NULL OR rs.evaluated_by = 'pending')
       ORDER BY rs.result_id`,
      [exam_id],
    );
    return result.rows;
  },

  getAllResultsByExam: async (exam_id) => {
    const result = await db.query(
      `SELECT rs.*, qb.question_text, qb.correct_option, qb.max_marks, qb.question_type,
              u.name as student_name, u.email as student_email
       FROM result_summary rs
       JOIN question_bank qb ON rs.question_id = qb.question_id
       JOIN users u ON rs.student_id = u.user_id
       WHERE rs.exam_id = $1
       ORDER BY rs.student_id, rs.result_id`,
      [exam_id],
    );
    return result.rows;
  },
};

module.exports = examModel;
