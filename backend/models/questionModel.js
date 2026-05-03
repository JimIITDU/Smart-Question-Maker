const db = require("../config/db");

const questionModel = {
  createQuestion: async (data) => {
    const {
      coaching_center_id,
      subject_id,
      course_id,
      class_name,
      subject_name,
      paper,
      chapter,
      chapter_name,
      topic,
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
      is_multiple_correct,
      created_by,
      source,
      status,
      negative_marks,
      explanation,
      chapter_id,
      options,
      correct_answers,
    } = data;

    // Parse options if passed as JSON string
    let parsedOptions = options;
    if (typeof options === "string") {
      try {
        parsedOptions = JSON.parse(options);
      } catch (e) {
        parsedOptions = null;
      }
    }

    // Parse correct_answers if passed as JSON string
    let parsedCorrectAnswers = correct_answers;
    if (typeof correct_answers === "string") {
      try {
        parsedCorrectAnswers = JSON.parse(correct_answers);
      } catch (e) {
        parsedCorrectAnswers = null;
      }
    }

    // Backward compatibility: extract individual option columns from options JSONB
    let optA = option_text_a || null;
    let optB = option_text_b || null;
    let optC = option_text_c || null;
    let optD = option_text_d || null;
    if (parsedOptions && typeof parsedOptions === "object") {
      optA = parsedOptions.a || parsedOptions.A || optA;
      optB = parsedOptions.b || parsedOptions.B || optB;
      optC = parsedOptions.c || parsedOptions.C || optC;
      optD = parsedOptions.d || parsedOptions.D || optD;
    }

    // Backward compatibility: convert correct_answers array to correct_option string
    let corrOpt = correct_option || null;
    if (parsedCorrectAnswers && Array.isArray(parsedCorrectAnswers)) {
      corrOpt = parsedCorrectAnswers.join(",");
    }

    // Build dynamic insert query based on available columns
    const baseColumns = [
      "coaching_center_id",
      "subject_id",
      "course_id",
      "class_name",
      "subject_name",
      "paper",
      "chapter",
      "chapter_name",
      "topic",
      "question_text",
      "question_type",
      "difficulty",
      "expected_answer",
      "max_marks",
      "option_text_a",
      "option_text_b",
      "option_text_c",
      "option_text_d",
      "correct_option",
      "is_multiple_correct",
      "created_by",
      "source",
      "status",
    ];
    const baseValues = [
      coaching_center_id,
      subject_id,
      course_id,
      class_name,
      subject_name,
      paper,
      chapter,
      chapter_name,
      topic,
      question_text,
      question_type,
      difficulty,
      expected_answer,
      max_marks,
      optA,
      optB,
      optC,
      optD,
      corrOpt,
      is_multiple_correct || false,
      created_by,
      source,
      status || "active",
    ];

    // Optional columns that may not exist in older databases
    const optionalColumns = [
      "negative_marks",
      "explanation",
      "chapter_id",
      "options",
      "correct_answers",
    ];
    const optionalValues = [
      negative_marks || 0,
      explanation || null,
      chapter_id || null,
      parsedOptions || null,
      parsedCorrectAnswers || null,
    ];

    const allColumns = [...baseColumns];
    const allValues = [...baseValues];

    // Only add optional columns if they have non-null values
    optionalColumns.forEach((col, idx) => {
      if (optionalValues[idx] !== null && optionalValues[idx] !== undefined) {
        allColumns.push(col);
        allValues.push(optionalValues[idx]);
      }
    });

    const params = allValues.map((_, idx) => `$${idx + 1}`).join(", ");
    const result = await db.query(
      `INSERT INTO question_bank (${allColumns.join(", ")}) VALUES (${params}) RETURNING question_id`,
      allValues,
    );
    return result.rows[0].question_id;
  },

  getAllQuestions: async (filters) => {
    let query = "SELECT * FROM question_bank WHERE 1=1";
    const values = [];
    let i = 1;

    // Mandatory tenant isolation
    if (filters.coaching_center_id) {
      query += ` AND coaching_center_id = $${i++}`;
      values.push(filters.coaching_center_id);
    }

    // Teacher isolation - only return questions created by this teacher
    if (filters.teacher_id) {
      query += ` AND created_by = $${i++}`;
      values.push(filters.teacher_id);
    }

    // Exclude soft-deleted by default unless explicitly requesting deleted
    if (filters.status) {
      query += ` AND status = $${i++}`;
      values.push(filters.status);
    } else {
      query += ` AND status != 'deleted'`;
    }

    // New filters
    if (filters.subject_id) {
      query += ` AND subject_id = $${i++}`;
      values.push(filters.subject_id);
    }
    if (filters.chapter_id) {
      query += ` AND chapter_id = $${i++}`;
      values.push(filters.chapter_id);
    }
    if (filters.difficulty) {
      query += ` AND difficulty = $${i++}`;
      values.push(filters.difficulty);
    }
    if (filters.question_type) {
      query += ` AND question_type = $${i++}`;
      values.push(filters.question_type);
    }
    if (filters.source) {
      query += ` AND source = $${i++}`;
      values.push(filters.source);
    }

    // Backward compatibility filters
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

    // Global search across key fields
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query += ` AND (
        question_text ILIKE $${i} OR
        subject_name ILIKE $${i} OR 
        chapter_name ILIKE $${i} OR 
        topic ILIKE $${i} OR
        class_name ILIKE $${i}
      )`;
      values.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      i += 4; // 5 uses of searchTerm
    }

    query += " ORDER BY created_at DESC";
    const result = await db.query(query, values);
    return result.rows;
  },

  getQuestionById: async (id, teacher_id, coaching_center_id) => {
    let query = "SELECT * FROM question_bank WHERE question_id = $1";
    const values = [id];
    let i = 2;

    if (teacher_id) {
      query += ` AND created_by = $${i++}`;
      values.push(teacher_id);
    }
    if (coaching_center_id) {
      query += ` AND coaching_center_id = $${i++}`;
      values.push(coaching_center_id);
    }

    const result = await db.query(query, values);
    return result.rows[0];
  },

  updateQuestion: async (id, data, teacher_id, coaching_center_id) => {
    // Verify ownership before updating
    const checkResult = await db.query(
      "SELECT question_id FROM question_bank WHERE question_id = $1 AND created_by = $2 AND coaching_center_id = $3",
      [id, teacher_id, coaching_center_id],
    );
    if (checkResult.rows.length === 0) {
      throw new Error("Question not found or access denied");
    }

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
      is_multiple_correct,
      class_name,
      subject_name,
      paper,
      chapter,
      chapter_name,
      topic,
      subject_id,
      course_id,
      status,
      negative_marks,
      explanation,
      chapter_id,
      options,
      correct_answers,
    } = data;

    // Parse options if passed as JSON string
    let parsedOptions = options;
    if (typeof options === "string") {
      try {
        parsedOptions = JSON.parse(options);
      } catch (e) {
        parsedOptions = null;
      }
    }

    // Parse correct_answers if passed as JSON string
    let parsedCorrectAnswers = correct_answers;
    if (typeof correct_answers === "string") {
      try {
        parsedCorrectAnswers = JSON.parse(correct_answers);
      } catch (e) {
        parsedCorrectAnswers = null;
      }
    }

    // Backward compatibility: extract individual option columns from options JSONB
    let optA = option_text_a || null;
    let optB = option_text_b || null;
    let optC = option_text_c || null;
    let optD = option_text_d || null;
    if (parsedOptions && typeof parsedOptions === "object") {
      optA = parsedOptions.a || parsedOptions.A || optA;
      optB = parsedOptions.b || parsedOptions.B || optB;
      optC = parsedOptions.c || parsedOptions.C || optC;
      optD = parsedOptions.d || parsedOptions.D || optD;
    }

    // Backward compatibility: convert correct_answers array to correct_option string
    let corrOpt = correct_option || null;
    if (parsedCorrectAnswers && Array.isArray(parsedCorrectAnswers)) {
      corrOpt = parsedCorrectAnswers.join(",");
    }

    // Build dynamic update query for backward compatibility with older DBs
    const baseUpdates = [
      "question_text=$1",
      "question_type=$2",
      "difficulty=$3",
      "expected_answer=$4",
      "max_marks=$5",
      "option_text_a=$6",
      "option_text_b=$7",
      "option_text_c=$8",
      "option_text_d=$9",
      "correct_option=$10",
      "is_multiple_correct=$11",
      "class_name=$12",
      "subject_name=$13",
      "paper=$14",
      "chapter=$15",
      "chapter_name=$16",
      "topic=$17",
      "subject_id=$18",
      "course_id=$19",
      "status=$20",
    ];
    const baseValues = [
      question_text,
      question_type,
      difficulty,
      expected_answer,
      max_marks,
      optA,
      optB,
      optC,
      optD,
      corrOpt,
      is_multiple_correct || false,
      class_name,
      subject_name,
      paper,
      chapter,
      chapter_name,
      topic,
      subject_id,
      course_id,
      status,
    ];

    // Optional column updates
    const optionalColumns = [
      "negative_marks",
      "explanation",
      "chapter_id",
      "options",
      "correct_answers",
    ];
    const optionalValues = [
      negative_marks || 0,
      explanation || null,
      chapter_id || null,
      parsedOptions || null,
      parsedCorrectAnswers || null,
    ];

    let paramIndex = 21;
    const setClauses = [...baseUpdates];
    const values = [...baseValues];

    optionalColumns.forEach((col, idx) => {
      if (optionalValues[idx] !== null && optionalValues[idx] !== undefined) {
        setClauses.push(`${col}=$${paramIndex++}`);
        values.push(optionalValues[idx]);
      }
    });

    // Always add the WHERE clause parameters at the end
    values.push(id, teacher_id, coaching_center_id);

    await db.query(
      `UPDATE question_bank SET ${setClauses.join(", ")} WHERE question_id=$${paramIndex++} AND created_by=$${paramIndex++} AND coaching_center_id=$${paramIndex}`,
      values,
    );
  },

  deleteQuestion: async (id, teacher_id, coaching_center_id) => {
    const result = await db.query(
      `UPDATE question_bank SET status = 'deleted' 
       WHERE question_id = $1 AND created_by = $2 AND coaching_center_id = $3
       RETURNING question_id`,
      [id, teacher_id, coaching_center_id],
    );
    return result.rows[0];
  },

  bulkCreateQuestions: async (questions) => {
    const ids = [];
    for (const q of questions) {
      const id = await questionModel.createQuestion(q);
      ids.push(id);
    }
    return ids;
  },

  getRandomQuestions: async (
    coaching_center_id,
    subject_id,
    difficulty,
    limit,
    teacher_id,
  ) => {
    let query = "SELECT * FROM question_bank WHERE status = $1";
    const values = ["active"];
    let i = 2;

    if (coaching_center_id) {
      query += ` AND coaching_center_id = $${i++}`;
      values.push(coaching_center_id);
    }
    if (teacher_id) {
      query += ` AND created_by = $${i++}`;
      values.push(teacher_id);
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

  bulkUpdateStatus: async (updates, teacher_id, coaching_center_id) => {
    const results = [];
    for (const update of updates) {
      const result = await db.query(
        `UPDATE question_bank 
         SET status = $1 
         WHERE question_id = $2 AND created_by = $3 AND coaching_center_id = $4
         RETURNING question_id`,
        [update.status, update.id, teacher_id, coaching_center_id],
      );
      if (result.rows.length > 0) {
        results.push(result.rows[0].question_id);
      }
    }
    return results;
  },

  saveAIGeneratedQuestions: async (
    questions,
    teacher_id,
    coaching_center_id,
  ) => {
    const ids = [];
    for (const q of questions) {
      const id = await questionModel.createQuestion({
        ...q,
        coaching_center_id,
        created_by: teacher_id,
        source: "ai_generated",
        status: "draft",
      });
      ids.push(id);
    }
    return ids;
  },

  /**
   * Save AI generated questions with metadata (filter fields)
   */
  saveAIGeneratedQuestionsWithMeta: async (
    questions,
    teacher_id,
    coaching_center_id,
    metadata,
  ) => {
    const ids = [];
    for (const q of questions) {
      const id = await questionModel.createQuestion({
        ...q,
        coaching_center_id,
        created_by: teacher_id,
        source: "ai_generated",
        status: "draft",
        // Apply metadata
        class_name: metadata?.class_name || null,
        subject_name: metadata?.subject_name || null,
        paper: metadata?.paper || null,
        chapter: metadata?.chapter || null,
        chapter_name: metadata?.chapter_name || null,
        topic: metadata?.topic || null,
        difficulty: metadata?.difficulty || q.difficulty || "medium",
      });
      ids.push(id);
    }
    return ids;
  },

  /**
   * Bulk update status with optional difficulty override
   */
  bulkUpdateStatusWithDifficulty: async (
    updates,
    teacher_id,
    coaching_center_id,
  ) => {
    const results = [];
    for (const update of updates) {
      // Build update data - include difficulty if provided
      const updateData = { status: update.status };
      if (update.difficulty) {
        updateData.difficulty = update.difficulty;
      }

      const result = await db.query(
        `UPDATE question_bank 
         SET status = $1, difficulty = COALESCE($2, difficulty)
         WHERE question_id = $3 AND created_by = $4 AND coaching_center_id = $5
         RETURNING question_id`,
        [
          update.status,
          update.difficulty || null,
          update.id,
          teacher_id,
          coaching_center_id,
        ],
      );
      if (result.rows.length > 0) {
        results.push(result.rows[0].question_id);
      }
    }
    return results;
  },
};

module.exports = questionModel;
