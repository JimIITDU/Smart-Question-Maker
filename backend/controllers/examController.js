const db = require("../config/db");
const examModel = require("../models/examModel");
const questionModel = require("../models/questionModel");
const teacherModel = require("../models/teacherModel");
const llmService = require("../services/llmService");
const centerModel = require("../models/centerModel");
const pdfService = require("../services/pdfService");

const notificationController = require("./notificationController");

const examController = {
  checkEnrollmentForStudent: async (req, res, next) => {
    try {
      if (req.user.role_id !== 5) return next();

      const examId = req.params.id || req.body.exam_id;
      if (!examId) return next();

      const exam = await examModel.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ success: false, message: "Exam not found" });
      }

      if (!exam.course_id || (exam.exam_type === "practice" && exam.is_public === true)) {
        return next();
      }

      const enrollmentResult = await db.query(
        `SELECT 1 FROM course_enrollments 
         WHERE student_id = $1 AND course_id = $2 AND status = 'active'
         AND (expires_at IS NULL OR expires_at > NOW())`,
        [req.user.user_id, exam.course_id]
      );

      if (enrollmentResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Not enrolled in required course or enrollment expired"
        });
      }

      next();
    } catch (error) {
      console.error("Enrollment check error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  createExam: async (req, res) => {
    try {
      const {
        course_id, subject_id, batch_id, exam_type, start_time, end_time,
        question_ids, title, duration_minutes, total_marks, pass_mark, negative_marks = 0,
        instructions, num_sets = 1, overlap_pct = 0, view_mode = 'vertical'
      } = req.body;

      const host_teacher_id = req.user?.user_id || req.user?.id;
      const coaching_center_id = req.user.coaching_center_id;

      if (!host_teacher_id || !coaching_center_id) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      if (course_id) {
        const assigned = await teacherModel.isTeacherAssignedToCourse(host_teacher_id, course_id);
        if (!assigned) {
          return res.status(403).json({ 
            success: false, 
            message: `Not assigned to course ${course_id}` 
          });
        }
      }

      let calculatedTotalMarks = total_marks || 0;
      if (Array.isArray(question_ids) && question_ids.length > 0 && !total_marks) {
        const validQuestions = await Promise.all(
          question_ids.map(id => questionModel.getQuestionById(id, host_teacher_id, coaching_center_id))
        );
        calculatedTotalMarks = validQuestions.reduce((sum, q) => sum + (q?.max_marks || 0), 0);
      }

      if (pass_mark && pass_mark > calculatedTotalMarks) {
        return res.status(400).json({ 
          success: false, 
          message: `Pass mark (${pass_mark}) exceeds total marks (${calculatedTotalMarks})` 
        });
      }

      const formattedStart = start_time ? start_time.replace("T", " ") : null;
      const formattedEnd = end_time ? end_time.replace("T", " ") : null;
      const access_code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const examId = await examModel.createExam({
        coaching_center_id,
        course_id: course_id || null,
        subject_id: subject_id || null,
        batch_id: batch_id || null,
        exam_type: exam_type || 'practice',
        host_teacher_id,
        title: title || `Exam ${new Date().toISOString().slice(0,10)}`,
        duration_minutes: duration_minutes || 60,
        start_time: formattedStart,
        end_time: formattedEnd,
        access_code,
        total_marks: calculatedTotalMarks,
        negative_marks,
        pass_mark: pass_mark || null,
        instructions: instructions || '',
        num_sets,
        overlap_pct,
        view_mode,
        skip_allowed: true
      });

      if (Array.isArray(question_ids) && question_ids.length > 0) {
        await examModel.addQuestionsToExam(examId, question_ids, num_sets, overlap_pct);
      }

      res.status(201).json({
        success: true,
        message: "Exam created successfully",
        data: { exam_id: examId, access_code }
      });

    } catch (error) {
      console.error("createExam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  addQuestionsByMode: async (req, res) => {
    try {
      const exam_id = req.params.id;
      const { mode, params } = req.body; // mode: 'manual'|'random'|'ai'|'mix', params: filters/count etc

      const exam = await examModel.getExamById(exam_id);
      if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

      let question_ids = [];

      switch (mode) {
        case 'manual':
          question_ids = params.question_ids || [];
          break;
        case 'random':
          question_ids = await questionModel.getRandomQuestions(
            req.user.coaching_center_id,
            params.subject_id,
            params.difficulty,
            params.count || 10,
            req.user.user_id
          ).then(rows => rows.map(q => q.question_id));
          break;
        case 'ai':
          const aiQuestions1 = await llmService.generateQuestion('zero-shot', params);
          question_ids = await questionModel.bulkCreateQuestions(aiQuestions1.map(q => ({
            ...q,
            coaching_center_id: req.user.coaching_center_id,
            created_by: req.user.user_id,
            source: 'ai_exam_gen'
          })));
          break;
        case 'mix':
          // 50% random bank, 50% AI
          const half = Math.floor((params.count || 20) / 2);
          const randomIds = await questionModel.getRandomQuestions(
            req.user.coaching_center_id,
            params.subject_id,
            params.difficulty,
            half,
            req.user.user_id
          ).then(rows => rows.map(q => q.question_id));
          const aiQuestions2 = await llmService.generateQuestion('zero-shot', {...params, count: half});
          const aiIds = await questionModel.bulkCreateQuestions(aiQuestions2.map(q => ({
            ...q,
            coaching_center_id: req.user.coaching_center_id,
            created_by: req.user.user_id,
            source: 'ai_exam_mix'
          })));
          question_ids = [...randomIds, ...aiIds];
          break;
        default:
          return res.status(400).json({ success: false, message: "Invalid mode" });
      }

      await examModel.addQuestionsToExam(exam_id, question_ids, params.num_sets || 1, params.overlap_pct || 0);

      res.json({ success: true, data: { added: question_ids.length, ids: question_ids } });
    } catch (error) {
      console.error("addQuestionsByMode error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateExamQuestions: async (req, res) => {
    try {
      const exam_id = req.params.id;
      const { question_ids, order, num_sets, overlap_pct } = req.body;

      // Clear existing
      await db.query('DELETE FROM exam_questions WHERE exam_id = $1', [exam_id]);

      // Add reordered
      await examModel.addQuestionsToExam(exam_id, question_ids || [], num_sets || 1, overlap_pct || 0);

      res.json({ success: true, message: "Questions updated successfully" });
    } catch (error) {
      console.error("updateExamQuestions error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  publishExam: async (req, res) => {
    try {
      const exam_id = req.params.id;
      await db.query('UPDATE quiz_exam SET status = $1 WHERE exam_id = $2', ['published', exam_id]);
      
      // Notify enrolled students
      const exam = await examModel.getExamById(exam_id);
      if (exam.course_id) {
        await notificationController.sendExamPublishedNotification(exam);
      }

      res.json({ success: true, message: "Exam published and students notified" });
    } catch (error) {
      console.error("publishExam error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ... all existing functions remain the same: getAllExams, getExamById, getExamQuestions, startExam, joinExam, submitExam (with negative), getResults, endExam, evaluateWritten, getAllResults, exportExamPDF

  getAllExams: async (req, res) => {
    try {
      let exams;
      if (req.user.role_id === 5) {
        exams = await examModel.getAllExamsForStudent(
          req.user.coaching_center_id,
        );
      } else {
        exams = await examModel.getAllExams(
          req.user.user_id,
          req.user.coaching_center_id,
        );
      }
      res.status(200).json({
        success: true,
        count: exams.length,
        data: exams,
      });
    } catch (error) {
      console.error("getAllExams error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getExamById: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }
      res.status(200).json({
        success: true,
        data: exam,
      });
    } catch (error) {
      console.error("getExamById error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getExamQuestions: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      const questions = await examModel.getExamQuestions(req.params.id);

      // Hide correct answers from students
      if (req.user.role_id === 5) {
        questions.forEach((q) => {
          delete q.correct_option;
          delete q.expected_answer;
        });
      }

      res.status(200).json({
        success: true,
        count: questions.length,
        data: questions,
      });
    } catch (error) {
      console.error("getExamQuestions error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  startExam: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      await examModel.updateExamStatus(req.params.id, "ongoing");

      res.status(200).json({
        success: true,
        message: "Exam started successfully",
      });
    } catch (error) {
      console.error("startExam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  joinExam: async (req, res) => {
    try {
      const { access_code } = req.body;

      const exam = await examModel.getExamByAccessCode(access_code);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Invalid access code",
        });
      }

      if (exam.status !== "ongoing") {
        return res.status(400).json({
          success: false,
          message: "Exam is not active",
        });
      }

      const questions = await examModel.getExamQuestions(exam.exam_id);

      // Hide answers from students
      questions.forEach((q) => {
        delete q.correct_option;
        delete q.expected_answer;
      });

      res.status(200).json({
        success: true,
        message: "Joined exam successfully",
        data: {
          exam,
          questions,
        },
      });
    } catch (error) {
      console.error("joinExam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  submitExam: async (req, res) => {
    try {
      // Check if already submitted
      const { answers } = req.body;
      const exam_id = req.params.id;

      const exam = await examModel.getExamById(exam_id);
      if (!exam.negative_marks) exam.negative_marks = 0;
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }
      const alreadySubmitted = await examModel.checkAlreadySubmitted(
        exam_id,
        req.user.user_id,
      );

      if (alreadySubmitted) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted this exam",
        });
      }

      let totalMarks = 0;
      let obtainedMarks = 0;
      const descriptiveResults = [];

      for (const answer of answers) {
        const question = await questionModel.getQuestionById(
          answer.question_id,
        );

        let marks_obtained = 0;
        let wrongAnswers = 0;

        // Auto grade MCQ - support multiple correct answers + negative
        if (question.question_type === "mcq") {
          const correctOptions = question.correct_option
            ? question.correct_option
                .split(",")
                .map((opt) => opt.trim().toUpperCase())
            : [];
          const selectedOptions = answer.selected_options
            ? answer.selected_options.map((opt) => opt.trim().toUpperCase())
            : [answer.selected_option?.trim().toUpperCase()].filter(Boolean);

          if (selectedOptions.length > 0 && correctOptions.length > 0) {
            // Check if all selected options are correct and no incorrect options selected
            const allCorrect = selectedOptions.every((opt) =>
              correctOptions.includes(opt),
            );
            const noExtra = selectedOptions.length === correctOptions.length;
            if (allCorrect && noExtra) {
              marks_obtained = question.max_marks;
            } else if (
              allCorrect &&
              selectedOptions.length < correctOptions.length
            ) {
              // Partial credit for partially correct
              marks_obtained =
                (selectedOptions.length / correctOptions.length) *
                question.max_marks;
            } else {
              // Wrong answer - negative marking
              wrongAnswers = 1;
            }
          } else if (selectedOptions.length > 0) {
            wrongAnswers = 1;
          }
          
          // Apply negative marking
          if (wrongAnswers > 0 && exam.negative_marks > 0) {
            marks_obtained -= exam.negative_marks;
            marks_obtained = Math.max(0, marks_obtained); // No negative score
          }
        }

        totalMarks += question.max_marks;
        obtainedMarks += marks_obtained;

        const resultId = await examModel.submitAnswer({
          coaching_center_id: req.user.coaching_center_id,
          exam_id,
          student_id: req.user.user_id,
          question_id: answer.question_id,
          descriptive_answer: answer.descriptive_answer || null,
          marks_obtained,
          evaluated_by:
            question.question_type === "mcq" ? "teacher" : "pending",
        });

        // Track descriptive answers for LLM evaluation
        if (question.question_type === "descriptive") {
          descriptiveResults.push({
            result_id: resultId,
            question_text: question.question_text,
            student_answer: answer.descriptive_answer,
            expected_answer: question.expected_answer,
            max_marks: question.max_marks,
          });
        }
      }

      // Auto-evaluate descriptive answers with LLM
      if (descriptiveResults.length > 0) {
        try {
          for (const desc of descriptiveResults) {
            const evaluation = await llmService.evaluateWrittenAnswer(
              desc.question_text,
              desc.student_answer,
              desc.expected_answer,
              desc.max_marks,
            );
            await examModel.evaluateResult(
              desc.result_id,
              evaluation.marks_obtained,
              evaluation.feedback,
              evaluation.confidence_score,
              "llm",
            );
            obtainedMarks += evaluation.marks_obtained;
          }
        } catch (evalError) {
          console.error("Auto LLM evaluation error:", evalError);
          // Continue without failing the submission
        }
      }

      const percentage = (obtainedMarks / totalMarks) * 100;

      const result_status = percentage >= 50 ? "pass" : "fail";

      res.status(200).json({
        success: true,
        message: "Exam submitted successfully",
        data: {
          total_marks: totalMarks,
          obtained_marks: obtainedMarks,
          percentage: percentage.toFixed(2),
          result_status,
        },
      });
    } catch (error) {
      console.error("submitExam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getResults: async (req, res) => {
    try {
      const results = await examModel.getStudentResults(
        req.params.id,
        req.user.user_id,
      );

      const summary = await examModel.calculateTotalMarks(
        req.params.id,
        req.user.user_id,
      );

      res.status(200).json({
        success: true,
        data: {
          results,
          summary,
        },
      });
    } catch (error) {
      console.error("getResults error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  endExam: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      await examModel.updateExamStatus(req.params.id, "completed");

      res.status(200).json({
        success: true,
        message: "Exam ended successfully",
      });
    } catch (error) {
      console.error("endExam error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  evaluateWritten: async (req, res) => {
    try {
      const exam_id = req.params.id;

      const exam = await examModel.getExamById(exam_id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      // Get un-evaluated descriptive results
      const unevaluated = await examModel.getUnevaluatedResults(exam_id);

      if (unevaluated.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No pending descriptive answers to evaluate",
          data: [],
        });
      }

      const evaluated = [];
      for (const result of unevaluated) {
        const evaluation = await llmService.evaluateWrittenAnswer(
          result.question_text,
          result.descriptive_answer,
          result.expected_answer,
          result.max_marks,
        );
        await examModel.evaluateResult(
          result.result_id,
          evaluation.marks_obtained,
          evaluation.feedback,
          evaluation.confidence_score,
          "llm",
        );
        evaluated.push({
          result_id: result.result_id,
          student_id: result.student_id,
          ...evaluation,
        });
      }

      res.status(200).json({
        success: true,
        message: `${evaluated.length} answer(s) evaluated successfully`,
        data: evaluated,
      });
    } catch (error) {
      console.error("evaluateWritten error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getAllResults: async (req, res) => {
    try {
      const results = await examModel.getAllResultsByExam(req.params.id);
      res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error("getAllResults error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  exportExamPDF: async (req, res) => {
    try {
      const examId = req.params.id;
      const numSets = parseInt(req.query.numSets) || 1;

      // Validate numSets (None=1, 2,3,4)
      if (numSets < 1 || numSets > 4) {
        return res.status(400).json({
          success: false,
          message: "Number of sets must be between 1 and 4",
        });
      }

      // Get exam details
      const exam = await examModel.getExamById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      // Verify the exam belongs to the user's coaching center
      if (exam.coaching_center_id !== req.user.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to export this exam",
        });
      }

      // Get center details
      const center = await centerModel.getCenterById(exam.coaching_center_id);

      // Get exam questions
      const questions = await examModel.getExamQuestions(examId);
      if (!questions || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No questions found for this exam",
        });
      }

      // Generate combined PDF
      const pdfBuffer = await pdfService.generateCombinedPDF(
        exam,
        center,
        questions,
        numSets
      );

      const safeTitle = (exam.title || "Exam").replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeTitle}_Sets_${numSets}.pdf"`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error("exportExamPDF error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Server error",
          error: error.message,
        });
      }
    }
  },
};

module.exports = examController;
