const db = require("../config/db");
const examModel = require("../models/examModel");
const questionModel = require("../models/questionModel");
const teacherModel = require("../models/teacherModel");
const llmService = require("../services/llmService");
const centerModel = require("../models/centerModel");
const pdfService = require("../services/pdfService");
const archiver = require("archiver");

const examController = {
  // Check if student is enrolled before accessing exam (student role_id = 5)
  checkEnrollmentForStudent: async (req, res, next) => {
    try {
      if (req.user.role_id !== 5) return next();

      const examId = req.params.id || req.body.exam_id;
      if (!examId) return next();

      const exam = await examModel.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ success: false, message: "Exam not found" });
      }

      // Skip enrollment check for public practice exams or exams without course
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
        question_ids, title, duration_minutes, total_marks, pass_mark,
        instructions, num_sets = 1, overlap_pct = 0
      } = req.body;

      const host_teacher_id = req.user?.user_id || req.user?.id;
      const coaching_center_id = req.user.coaching_center_id;

      if (!host_teacher_id || !coaching_center_id) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      // Validate course assignment
      if (course_id) {
        const assigned = await teacherModel.isTeacherAssignedToCourse(host_teacher_id, course_id);
        if (!assigned) {
          return res.status(403).json({ 
            success: false, 
            message: `Not assigned to course ${course_id}` 
          });
        }
      }

      // Calculate total_marks if not provided
      let calculatedTotalMarks = total_marks || 0;
      if (Array.isArray(question_ids) && question_ids.length > 0 && !total_marks) {
        const validQuestions = await Promise.all(
          question_ids.map(id => questionModel.getQuestionById(id, host_teacher_id, coaching_center_id))
        );
        calculatedTotalMarks = validQuestions.reduce((sum, q) => sum + (q?.max_marks || 0), 0);
      }

      // Validate pass_mark
      if (pass_mark && pass_mark > calculatedTotalMarks) {
        return res.status(400).json({ 
          success: false, 
          message: `Pass mark (${pass_mark}) exceeds total marks (${calculatedTotalMarks})` 
        });
      }

      // Format dates and generate access code
      const formattedStart = start_time ? start_time.replace("T", " ") : null;
      const formattedEnd = end_time ? end_time.replace("T", " ") : null;
      const access_code = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create exam
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
        pass_mark: pass_mark || null,
        instructions: instructions || '',
        num_sets,
        overlap_pct
      });

      // Add questions
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
        message: "Failed to create exam",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getAllExams: async (req, res) => {
    try {
      let exams;
      if (req.user.role_id === 5) { // Student
        exams = await examModel.getAllExamsForStudent(req.user.coaching_center_id);
      } else {
        exams = await examModel.getAllExams(req.user.user_id, req.user.coaching_center_id);
      }
      res.json({ success: true, count: exams.length, data: exams });
    } catch (error) {
      console.error("getAllExams error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getExamById: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({ success: false, message: "Exam not found" });
      }
      res.json({ success: true, data: exam });
    } catch (error) {
      console.error("getExamById error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getExamQuestions: async (req, res) => {
    try {
      const questions = await examModel.getExamQuestions(req.params.id);
      
      // Hide answers from students
      if (req.user.role_id === 5) {
        questions.forEach(q => {
          delete q.correct_option;
          delete q.expected_answer;
        });
      }
      
      res.json({ success: true, count: questions.length, data: questions });
    } catch (error) {
      console.error("getExamQuestions error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  joinExam: async (req, res) => {
    try {
      const { access_code } = req.body;
      const exam = await examModel.getExamByAccessCode(access_code);
      
      if (!exam || exam.status !== "ongoing") {
        return res.status(400).json({ success: false, message: "Invalid or inactive access code" });
      }

      const questions = await examModel.getExamQuestions(exam.exam_id);
      // Hide answers
      questions.forEach(q => {
        delete q.correct_option;
        delete q.expected_answer;
      });

      res.json({ success: true, data: { exam, questions } });
    } catch (error) {
      console.error("joinExam error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  submitExam: async (req, res) => {
    try {
      const { answers } = req.body;
      const exam_id = req.params.id;

      // Check already submitted
      if (await examModel.checkAlreadySubmitted(exam_id, req.user.user_id)) {
        return res.status(400).json({ success: false, message: "Already submitted" });
      }

      let totalMarks = 0, obtainedMarks = 0;
      const descriptiveResults = [];

      for (const answer of answers) {
        const question = await questionModel.getQuestionById(answer.question_id);
        if (!question) continue;

        let marks_obtained = 0;

        if (question.question_type === "mcq") {
          // MCQ auto-grading logic
          const correctOptions = (question.correct_option || '').split(',').map(o => o.trim().toUpperCase());
          const selectedOptions = Array.isArray(answer.selected_options) 
            ? answer.selected_options.map(o => o.trim().toUpperCase())
            : [answer.selected_option?.trim().toUpperCase() || ''].filter(Boolean);

          const allCorrect = selectedOptions.every(opt => correctOptions.includes(opt));
          const perfectMatch = selectedOptions.length === correctOptions.length;
          
          if (allCorrect && perfectMatch) {
            marks_obtained = question.max_marks;
          } else if (allCorrect) {
            marks_obtained = (selectedOptions.length / correctOptions.length) * question.max_marks;
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
          evaluated_by: question.question_type === "mcq" ? "auto" : "pending"
        });

        if (question.question_type === "descriptive") {
          descriptiveResults.push({ resultId, ...answer, question, max_marks: question.max_marks });
        }
      }

      // LLM evaluation for descriptive
      for (const desc of descriptiveResults) {
        try {
          const evaluation = await llmService.evaluateWrittenAnswer(
            desc.question.question_text,
            desc.descriptive_answer,
            desc.question.expected_answer,
            desc.max_marks
          );
          await examModel.evaluateResult(
            desc.resultId,
            evaluation.marks_obtained,
            evaluation.feedback,
            evaluation.confidence_score,
            "llm"
          );
          obtainedMarks += evaluation.marks_obtained;
        } catch (evalError) {
          console.error("LLM eval error:", evalError);
        }
      }

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
      
      res.json({
        success: true,
        data: {
          total_marks: totalMarks,
          obtained_marks: obtainedMarks,
          percentage: percentage.toFixed(2),
          result_status: percentage >= 50 ? "pass" : "fail"
        }
      });

    } catch (error) {
      console.error("submitExam error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Teacher endpoints
  startExam: async (req, res) => {
    try {
      await examModel.updateExamStatus(req.params.id, "ongoing");
      res.json({ success: true, message: "Exam started" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  endExam: async (req, res) => {
    try {
      await examModel.updateExamStatus(req.params.id, "completed");
      res.json({ success: true, message: "Exam ended" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getResults: async (req, res) => {
    try {
      const results = await examModel.getStudentResults(req.params.id, req.user.user_id);
      const summary = await examModel.calculateTotalMarks(req.params.id, req.user.user_id);
      res.json({ success: true, data: { results, summary } });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getAllResults: async (req, res) => {
    try {
      const results = await examModel.getAllResultsByExam(req.params.id);
      res.json({ success: true, count: results.length, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  evaluateWritten: async (req, res) => {
    try {
      const unevaluated = await examModel.getUnevaluatedResults(req.params.id);
      if (unevaluated.length === 0) {
        return res.json({ success: true, message: "No pending evaluations", data: [] });
      }

      const evaluated = [];
      for (const result of unevaluated) {
        const evaluation = await llmService.evaluateWrittenAnswer(
          result.question_text,
          result.descriptive_answer,
          result.expected_answer,
          result.max_marks
        );
        await examModel.evaluateResult(
          result.result_id,
          evaluation.marks_obtained,
          evaluation.feedback,
          evaluation.confidence_score,
          "llm"
        );
        evaluated.push({ result_id: result.result_id, ...evaluation });
      }

      res.json({ 
        success: true, 
        message: `${evaluated.length} answers evaluated`,
        data: evaluated 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // Export PDF sets with answer keys
  exportExamPDF: async (req, res) => {
    try {
      const examId = req.params.id;
      const numSets = parseInt(req.query.numSets) || 2;

      if (numSets < 1 || numSets > 4) {
        return res.status(400).json({ success: false, message: "Sets must be 1-4" });
      }

      const exam = await examModel.getExamById(examId);
      if (!exam || exam.coaching_center_id !== req.user.coaching_center_id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      const center = await centerModel.getCenterById(exam.coaching_center_id);
      const questions = await examModel.getExamQuestions(examId);
      const sets = await pdfService.generateExamSets(exam, center, questions, numSets);

      // ZIP response
      const archive = archiver("zip", { zlib: { level: 9 } });
      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${exam.title.replace(/\s+/g, "_")}_sets.zip"`
      });

      archive.pipe(res);
      sets.forEach(set => {
        archive.append(set.examPDF, { name: set.examFilename });
        archive.append(set.answerKeyPDF, { name: set.answerKeyFilename });
      });
      await archive.finalize();

    } catch (error) {
      console.error("PDF export error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Export failed" });
      }
    }
  }
};

module.exports = examController;
