const questionModel = require("../models/questionModel");
const pdfService = require("../services/pdfService");

const questionController = {
  createQuestion: async (req, res) => {
    try {
      const questionData = {
        ...req.body,
        coaching_center_id: req.tenant.coaching_center_id,
        created_by: req.user.user_id,
        source: "manual",
        status: "active",
      };

      // Map marks to max_marks if provided
      if (req.body.marks !== undefined) {
        questionData.max_marks = req.body.marks;
      }

      const questionId = await questionModel.createQuestion(questionData);

      res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: { question_id: questionId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getAllQuestions: async (req, res) => {
    try {
      const filters = {
        coaching_center_id: req.tenant.coaching_center_id,
        teacher_id: req.user.user_id,
        subject_id: req.query.subject_id,
        chapter_id: req.query.chapter_id,
        difficulty: req.query.difficulty,
        question_type: req.query.question_type,
        source: req.query.source,
        status: req.query.status,
        // Backward compatibility filters
        course_id: req.query.course_id,
        class_name: req.query.class_name,
        subject_name: req.query.subject_name,
        paper: req.query.paper,
        chapter: req.query.chapter,
        chapter_name: req.query.chapter_name,
        topic: req.query.topic,
      };

      const questions = await questionModel.getAllQuestions(filters);

      res.status(200).json({
        success: true,
        count: questions.length,
        data: questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getQuestionById: async (req, res) => {
    try {
      const question = await questionModel.getQuestionById(
        req.params.id,
        req.user.user_id,
        req.tenant.coaching_center_id,
      );
      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }
      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  updateQuestion: async (req, res) => {
    try {
      // Map marks to max_marks if provided
      const updateData = { ...req.body };
      if (req.body.marks !== undefined) {
        updateData.max_marks = req.body.marks;
      }

      await questionModel.updateQuestion(
        req.params.id,
        updateData,
        req.user.user_id,
        req.tenant.coaching_center_id,
      );

      res.status(200).json({
        success: true,
        message: "Question updated successfully",
      });
    } catch (error) {
      if (error.message === "Question not found or access denied") {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  deleteQuestion: async (req, res) => {
    try {
      const result = await questionModel.deleteQuestion(
        req.params.id,
        req.user.user_id,
        req.tenant.coaching_center_id,
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Question not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Question deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  bulkCreateQuestions: async (req, res) => {
    try {
      const { questions } = req.body;

      if (!questions || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No questions provided",
        });
      }

      const questionsWithUser = questions.map((q) => ({
        ...q,
        coaching_center_id: req.tenant.coaching_center_id,
        created_by: req.user.user_id,
        source: "manual",
        status: "active",
      }));

      const ids = await questionModel.bulkCreateQuestions(questionsWithUser);

      res.status(201).json({
        success: true,
        message: `${ids.length} questions created successfully`,
        data: { question_ids: ids },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  /**
   * Enhanced bulk create with custom metadata (used for AI generated questions with filters)
   */
  bulkCreateWithMeta: async (req, res) => {
    try {
      const { questions, source, metadata } = req.body;

      if (!questions || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No questions provided",
        });
      }

      // Process each question with provided metadata
      const questionsWithMeta = questions.map((q) => ({
        ...q,
        coaching_center_id: req.tenant.coaching_center_id,
        created_by: req.user.user_id,
        source: source || "ai_generated",
        status: "draft",
        // Apply metadata overrides including new filter fields
        class_name: metadata?.class_name || q.class_name || null,
        subject_name: metadata?.subject_name || q.subject_name || null,
        paper: metadata?.paper || q.paper || null,
        chapter: metadata?.chapter || q.chapter || null,
        chapter_name: metadata?.chapter_name || q.chapter_name || null,
        topic: metadata?.topic || q.topic || null,
        difficulty: metadata?.difficulty || q.difficulty || "medium",
      }));

      const ids = await questionModel.bulkCreateQuestions(questionsWithMeta);

      // Fetch created questions to return with full data
      const savedQuestions = [];
      for (const id of ids) {
        const q = await questionModel.getQuestionById(
          id,
          req.user.user_id,
          req.tenant.coaching_center_id,
        );
        if (q) savedQuestions.push(q);
      }

      res.status(201).json({
        success: true,
        message: `${ids.length} questions created successfully`,
        data: savedQuestions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getRandomQuestions: async (req, res) => {
    try {
      const { subject_id, difficulty, limit } = req.query;

      const questions = await questionModel.getRandomQuestions(
        req.tenant.coaching_center_id,
        subject_id,
        difficulty,
        parseInt(limit) || 10,
        req.user.user_id,
      );

      res.status(200).json({
        success: true,
        count: questions.length,
        data: questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  /**
   * Enhanced AI Question Generator - Supports new filter fields and multi-type generation
   * Accepts: class_name, subject_name, paper, chapter, chapter_name, topic,
   *         source_type, question_types (array), count, hints (optional text), pdf (optional file)
   */
  aiGenerate: async (req, res) => {
    try {
      const llmService = require("../services/llmService");

      // Extract new filter fields
      const {
        class_name,
        subject_name,
        paper,
        chapter,
        chapter_name,
        topic,
        source_type,
        question_types,
        count,
        hints,
        content,
        difficulty,
        // Legacy fields for backward compatibility
        subject_id,
        chapter_id,
        mode: frontendMode,
      } = req.body;

      // Support both 'source_type' (new) and 'mode' (legacy) fields
      const effectiveSourceType = source_type || frontendMode || "general";

      // Extract type-specific counts from frontend (priority) or fallback to uniform
      const typeCounts = req.body.type_counts || {};
      const effectiveQuestionTypes = Array.isArray(question_types) && question_types.length > 0 
        ? question_types 
        : Object.keys(typeCounts).filter(k => (typeCounts[k] || 0) > 0) || ["mcq"];

      // Build display topic for LLM
      let llmTopic =
        topic ||
        chapter_name ||
        `Chapter ${chapter || ""} - ${subject_name || "General"}`;
      let llmHints = hints || content || "";
      let llmMode = "random";

      // Handle PDF text extraction
      let pdfText = "";
      if (req.file) {
        // PDF file was uploaded - extract text
        try {
          // Note: In production, use proper PDF parsing; here we add placeholder
          pdfText = "[PDF content extracted]";
          if (effectiveSourceType === "pdf") {
            llmHints = pdfText + " " + llmHints;
          }
        } catch (pdfError) {
          console.error("PDF extraction error:", pdfError);
        }
      }

      // Handle 'previous' source_type - fetch teacher's existing questions for context
      let previousContext = "";
      if (effectiveSourceType === "previous") {
        try {
          const filters = {
            coaching_center_id: req.tenant.coaching_center_id,
            teacher_id: req.user.user_id,
            subject_name: subject_name,
            chapter: chapter,
            status: "active",
          };
          const existingQuestions =
            await questionModel.getAllQuestions(filters);

          if (existingQuestions.length > 0) {
            // Build context from previous questions
            previousContext = existingQuestions
              .slice(0, 10)
              .map((q, idx) => {
                return (
                  `Q${idx + 1}: ${q.question_text}` +
                  (q.question_type === "mcq" && q.option_text_a
                    ? ` [Options: A) ${q.option_text_a} B) ${q.option_text_b} C) ${q.option_text_c} D) ${q.option_text_d}]`
                    : "") +
                  ` Answer: ${q.correct_option || q.expected_answer || "N/A"}`
                );
              })
              .join("\n");
            llmHints = previousContext + "\n\nAdditional hints: " + llmHints;
          }
        } catch (prevError) {
          console.error("Error fetching previous questions:", prevError);
        }
      }

      // Map source_type to LLM mode
      switch (effectiveSourceType) {
        case "general":
          llmMode = "random";
          llmTopic =
            topic ||
            chapter_name ||
            `Subject: ${subject_name}, Chapter ${chapter}`;
          break;
        case "text":
          llmMode = "guided";
          llmTopic = topic || chapter_name || "Topic from teacher input";
          break;
        case "pdf":
          llmMode = "guided";
          llmTopic = topic || chapter_name || "Content from PDF";
          break;
        case "previous":
          llmMode = "zero-shot";
          llmTopic =
            topic ||
            chapter_name ||
            `Subject: ${subject_name}, Chapter ${chapter}`;
          break;
        // Legacy frontend mode mappings
        case "random":
          llmMode = "random";
          llmTopic = topic || `Subject: ${subject_name}, Chapter ${chapter}`;
          break;
        case "guided":
          llmMode = "guided";
          llmTopic = topic || "Teacher provided topic";
          break;
        case "zero-shot":
          llmMode = "zero-shot";
          llmTopic = topic || subject_name || "General";
          break;
        default:
          llmMode = "random";
          llmTopic = topic || subject_name || "General";
      }

      console.log("[AI-GEN] Request:", {effectiveSourceType, effectiveQuestionTypes, typeCounts: req.body.type_counts, totalCount: count});

      let allGeneratedQuestions = [];

      // Generate EXACT counts per type from frontend type_counts
      for (const qType of effectiveQuestionTypes) {
        const perTypeCount = Math.max(1, (typeCounts[qType] || 0)) || Math.ceil((parseInt(count) || 5) / effectiveQuestionTypes.length);
        console.log(`[AI-GEN] Generating ${perTypeCount} ${qType} questions`);
        const generated = await llmService.generateQuestion(llmMode, {
          topic: llmTopic,
          hints: llmHints,
          subject_id: subject_name || "",
          question_type: qType,
          difficulty: difficulty || "medium",
          count: perTypeCount,
        });

        // Transform to our format
        const transformed = generated.map((q, idx) => ({
          question_text: q.question_text || `Generated ${qType} question`,
          question_type: qType,
          difficulty: q.difficulty || difficulty || "medium",
          max_marks: q.max_marks || (qType === "descriptive" ? 5 : 2),
          // MCQ options
          option_text_a: q.option_text_a || null,
          option_text_b: q.option_text_b || null,
          option_text_c: q.option_text_c || null,
          option_text_d: q.option_text_d || null,
          correct_option:
            q.correct_option || (qType === "true_false" ? "True" : "A"),
          is_multiple_correct: q.is_multiple_correct || false,
          // Descriptive answer
          expected_answer: q.expected_answer || null,
          // Metadata
          source: "ai_generated",
          explanation: q.explanation || null,
        }));

        allGeneratedQuestions = [...allGeneratedQuestions, ...transformed];
      }

      // No trim needed - using exact per-type counts
      // allGeneratedQuestions = allGeneratedQuestions.slice(0, targetCount);

      // Build metadata object for questions
      const questionMetadata = {
        class_name,
        subject_name,
        paper: paper || null,
        chapter: chapter || null,
        chapter_name: chapter_name || null,
        topic: topic || null,
        difficulty: difficulty || "medium",
      };

      // Save as drafts with teacher isolation and metadata
      const savedIds = await questionModel.saveAIGeneratedQuestionsWithMeta(
        allGeneratedQuestions,
        req.user.user_id,
        req.tenant.coaching_center_id,
        questionMetadata,
      );

      // Fetch saved questions to return with IDs
      const savedQuestions = [];
      for (const id of savedIds) {
        const q = await questionModel.getQuestionById(
          id,
          req.user.user_id,
          req.tenant.coaching_center_id,
        );
        if (q) savedQuestions.push(q);
      }

      res.status(201).json({
        success: true,
        message: `${savedQuestions.length} questions generated and saved as drafts`,
        data: savedQuestions,
      });
    } catch (error) {
      console.error("AI generate error:", error);
      res.status(500).json({
        success: false,
        message: "AI generation failed",
        error: error.message,
      });
    }
  },

bulkUpdateStatus: async (req, res) => {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No updates provided. Expected array of {id, status}",
        });
      }

      // Validate each update - accept id, status, and optional difficulty
      for (const update of updates) {
        if (!update.id || !update.status) {
          return res.status(400).json({
            success: false,
            message: "Each update must have id and status",
          });
        }
      }

      const updatedIds = await questionModel.bulkUpdateStatusWithDifficulty(
        updates,
        req.user.user_id,
        req.tenant.coaching_center_id,
      );

      res.status(200).json({
        success: true,
        message: `${updatedIds.length} questions updated`,
        data: { updated_ids: updatedIds },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  /**
   * Random stratified batch: filters + diff % split → proportionate random sample
   * Body: {filters:{}, count:20, diffSplit:{easy:30,medium:50,hard:20}}
   */
  randomBatch: async (req, res) => {
    try {
      const { filters = {}, count = 10, diffSplit = {easy:33,medium:34,hard:33} } = req.body;
      const totalPct = Object.values(diffSplit).reduce((a,b) => a + Number(b), 0);
      if (totalPct !== 100) {
        return res.status(400).json({success:false, message:"diffSplit must sum to 100"});
      }

      const strata = Object.entries(diffSplit).map(([diff, pct]) => ({
        difficulty: diff,
        count: Math.max(1, Math.round(count * (pct / 100)))
      }));

      const questions = [];
      for (const stratum of strata) {
        const stratumFilters = {...filters, difficulty: stratum.difficulty, status: 'active'};
        const stratumQs = await questionModel.getAllQuestions({
          ...stratumFilters,
          coaching_center_id: req.tenant.coaching_center_id,
          teacher_id: req.user.user_id
        });
        // Random sample
        for (let i = 0; i < stratum.count && i < stratumQs.length; i++) {
          const randIdx = Math.floor(Math.random() * stratumQs.length);
          questions.push(stratumQs[randIdx]);
          stratumQs.splice(randIdx, 1); // Remove to avoid duplicates
        }
      }

      res.json({
        success: true,
        data: questions.slice(0, count),
        count: questions.length,
        breakdown: strata.map(s => ({[s.difficulty]: s.count}))
      });
    } catch (error) {
      console.error('randomBatch error:', error);
      res.status(500).json({success: false, message: error.message});
    }
  },

  /**
   * Check bank sufficiency for required type counts matching filters
   * Body: {filters:{}, required:{mcq:10,true_false:5,descriptive:5}}
   * Returns: {sufficiency:{mcq:{required:10,available:8,gap:2},...}}
   */
  checkSufficiency: async (req, res) => {
    try {
      const { filters = {}, required = {} } = req.body;
      if (Object.keys(required).length === 0) {
        return res.status(400).json({success:false, message:"required counts needed"});
      }

      const sufficiency = {};
      for (const [qtype, reqCount] of Object.entries(required)) {
        const typeFilters = {...filters, question_type: qtype, status: 'active'};
        const typeQs = await questionModel.getAllQuestions({
          ...typeFilters,
          coaching_center_id: req.tenant.coaching_center_id,
          teacher_id: req.user.user_id
        });
        sufficiency[qtype] = {
          required: reqCount,
          available: typeQs.length,
          gap: Math.max(0, reqCount - typeQs.length),
          sufficient: typeQs.length >= reqCount
        };
      }

      const totalGap = Object.values(sufficiency).reduce((sum, s) => sum + s.gap, 0);
      res.json({
        success: true,
        sufficiency,
        totalGap,
        canProceed: totalGap === 0
      });
    } catch (error) {
      console.error('checkSufficiency error:', error);
      res.status(500).json({success: false, message: error.message});
    }
  },
};

module.exports = questionController;

