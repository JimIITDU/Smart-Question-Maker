const examModel = require('../models/examModel');
const questionModel = require('../models/questionModel');
const llmService = require('../services/llmService');
const centerModel = require('../models/centerModel');
const pdfService = require('../services/pdfService');
const archiver = require('archiver');



const examController = {
  createExam: async (req, res) => {
    try {
      const {
        subject_id,
        batch_id,
        exam_type,
        start_time,
        end_time,
        question_ids,
        title,
        duration_minutes,
      } = req.body;

      // 1. Convert '2026-04-27T23:32' to '2026-04-27 23:32:00'
      const formattedStart = start_time ? start_time.replace('T', ' ') : null;
      const formattedEnd = end_time ? end_time.replace('T', ' ') : null;

      // 2. Access Code
      const access_code = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 3. User ID Check (Safety for different middleware setups)
      const host_teacher_id = req.user?.user_id || req.user?.id;

      if (!host_teacher_id) {
        return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      // 4. Create the Exam
      const examId = await examModel.createExam({
        coaching_center_id: req.user.coaching_center_id,
        subject_id,
        batch_id,
        exam_type,
        host_teacher_id,
        title: title || `Exam ${subject_id || 'N/A'}`,
        duration_minutes: duration_minutes || 60,
        start_time: formattedStart,
        end_time: formattedEnd,
        access_code,
      });

      // 5. Add Questions
      if (Array.isArray(question_ids) && question_ids.length > 0) {
        await examModel.addQuestionsToExam(examId, question_ids);
      }

      res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        data: { exam_id: examId, access_code },
      });

    } catch (error) {
      // THIS PRINTS THE REAL ERROR IN YOUR TERMINAL
      console.error("--- BACKEND CRASH LOG ---");
      console.error(error); 
      
      // THIS SENDS THE REAL ERROR TO YOUR BROWSER
      res.status(500).json({
        success: false,
        message: 'Database Error',
        error: error.message,
        sqlMessage: error.sqlMessage, // Specific MySQL error
        hint: "Check if subject_id 102 and batch_id 201 exist in your DB"
      });
    }
  },

  // Get all exams
  getAllExams: async (req, res) => {
    try {
      let exams;
      if (req.user.role_id === 5) {
        exams = await examModel.getAllExamsForStudent(req.user.coaching_center_id);
      } else {
        exams = await examModel.getAllExams(req.user.user_id, req.user.coaching_center_id);
      }
      res.status(200).json({
        success: true,
        count: exams.length,
        data: exams,
      });
    } catch (error) {
      console.error('getAllExams error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get exam by ID
  getExamById: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }
      res.status(200).json({
        success: true,
        data: exam,
      });
    } catch (error) {
      console.error('getExamById error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get exam questions
  getExamQuestions: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }

      const questions = await examModel.getExamQuestions(
        req.params.id
      );

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
      console.error('getExamQuestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Start exam
  startExam: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }

      await examModel.updateExamStatus(req.params.id, 'ongoing');

      res.status(200).json({
        success: true,
        message: 'Exam started successfully',
      });
    } catch (error) {
      console.error('startExam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Join exam by access code (live quiz)
  joinExam: async (req, res) => {
    try {
      const { access_code } = req.body;

      const exam = await examModel.getExamByAccessCode(
        access_code
      );
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Invalid access code',
        });
      }

      if (exam.status !== 'ongoing') {
        return res.status(400).json({
          success: false,
          message: 'Exam is not active',
        });
      }

      const questions = await examModel.getExamQuestions(
        exam.exam_id
      );

      // Hide answers from students
      questions.forEach((q) => {
        delete q.correct_option;
        delete q.expected_answer;
      });

      res.status(200).json({
        success: true,
        message: 'Joined exam successfully',
        data: {
          exam,
          questions,
        },
      });
    } catch (error) {
      console.error('joinExam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Submit exam answers
  submitExam: async (req, res) => {
    try {
        // Check if already submitted
        const { answers } = req.body;
        const exam_id = req.params.id;
        
        const exam = await examModel.getExamById(exam_id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found',
            });
        }
        const alreadySubmitted = await examModel.checkAlreadySubmitted(
          exam_id,
          req.user.user_id
        );
        
        if (alreadySubmitted) {
          return res.status(400).json({
            success: false,
            message: 'You have already submitted this exam',
          });
        }

      let totalMarks = 0;
      let obtainedMarks = 0;
      const descriptiveResults = [];

      for (const answer of answers) {
        const question = await questionModel.getQuestionById(
          answer.question_id
        );

        let marks_obtained = 0;

        // Auto grade MCQ - support multiple correct answers
        if (question.question_type === 'mcq') {
          const correctOptions = question.correct_option
            ? question.correct_option.split(',').map((opt) => opt.trim().toUpperCase())
            : [];
          const selectedOptions = answer.selected_options
            ? answer.selected_options.map((opt) => opt.trim().toUpperCase())
            : [answer.selected_option?.trim().toUpperCase()].filter(Boolean);

          if (selectedOptions.length > 0 && correctOptions.length > 0) {
            // Check if all selected options are correct and no incorrect options selected
            const allCorrect = selectedOptions.every((opt) => correctOptions.includes(opt));
            const noExtra = selectedOptions.length === correctOptions.length;
            if (allCorrect && noExtra) {
              marks_obtained = question.max_marks;
            } else if (allCorrect && selectedOptions.length < correctOptions.length) {
              // Partial credit for partially correct
              marks_obtained = (selectedOptions.length / correctOptions.length) * question.max_marks;
            }
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
          evaluated_by: question.question_type === 'mcq'
            ? 'teacher'
            : 'pending',
        });

        // Track descriptive answers for LLM evaluation
        if (question.question_type === 'descriptive') {
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
              desc.max_marks
            );
            await examModel.evaluateResult(
              desc.result_id,
              evaluation.marks_obtained,
              evaluation.feedback,
              evaluation.confidence_score,
              'llm'
            );
            obtainedMarks += evaluation.marks_obtained;
          }
        } catch (evalError) {
          console.error('Auto LLM evaluation error:', evalError);
          // Continue without failing the submission
        }
      }

      const percentage = (obtainedMarks / totalMarks) * 100;

      const result_status = percentage >= 50 ? 'pass' : 'fail';

      res.status(200).json({
        success: true,
        message: 'Exam submitted successfully',
        data: {
          total_marks: totalMarks,
          obtained_marks: obtainedMarks,
          percentage: percentage.toFixed(2),
          result_status,
        },
      });
    } catch (error) {
      console.error('submitExam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get student results
  getResults: async (req, res) => {
    try {
      const results = await examModel.getStudentResults(
        req.params.id,
        req.user.user_id
      );

      const summary = await examModel.calculateTotalMarks(
        req.params.id,
        req.user.user_id
      );

      res.status(200).json({
        success: true,
        data: {
          results,
          summary,
        },
      });
    } catch (error) {
      console.error('getResults error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // End exam
  endExam: async (req, res) => {
    try {
      const exam = await examModel.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }

      await examModel.updateExamStatus(
        req.params.id,
        'completed'
      );

      res.status(200).json({
        success: true,
        message: 'Exam ended successfully',
      });
    } catch (error) {
      console.error('endExam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Evaluate written answers with LLM (teacher endpoint)
  evaluateWritten: async (req, res) => {
    try {
      const exam_id = req.params.id;

      const exam = await examModel.getExamById(exam_id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }

      // Get un-evaluated descriptive results
      const unevaluated = await examModel.getUnevaluatedResults(exam_id);

      if (unevaluated.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No pending descriptive answers to evaluate',
          data: [],
        });
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
          'llm'
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
      console.error('evaluateWritten error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get all results for an exam (teacher endpoint)
  getAllResults: async (req, res) => {
    try {
      const results = await examModel.getAllResultsByExam(req.params.id);
      res.status(200).json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error('getAllResults error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Export exam as PDF sets with answer keys
  exportExamPDF: async (req, res) => {
    try {
      const examId = req.params.id;
      const numSets = parseInt(req.query.numSets) || 2;

      // Validate numSets
      if (numSets < 1 || numSets > 4) {
        return res.status(400).json({
          success: false,
          message: 'Number of sets must be between 1 and 4',
        });
      }

      // Get exam details
      const exam = await examModel.getExamById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }

      // Verify the exam belongs to the user's coaching center
      if (exam.coaching_center_id !== req.user.coaching_center_id) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to export this exam',
        });
      }

      // Get center details
      const center = await centerModel.getCenterById(exam.coaching_center_id);

      // Get exam questions
      const questions = await examModel.getExamQuestions(examId);
      if (!questions || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No questions found for this exam',
        });
      }

      // Generate PDF sets
      const sets = await pdfService.generateExamSets(exam, center, questions, numSets);

      // Create ZIP archive
      const archive = archiver('zip', { zlib: { level: 9 } });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${(exam.title || 'Exam').replace(/\s+/g, '_')}_Sets.zip"`
      );

      archive.on('error', (err) => {
        console.error('Archive error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to create ZIP archive',
          });
        }
      });

      archive.pipe(res);

      // Add exam PDFs and answer keys to archive
      sets.forEach((set) => {
        archive.append(set.examPDF, { name: set.examFilename });
        archive.append(set.answerKeyPDF, { name: set.answerKeyFilename });
      });

      await archive.finalize();

    } catch (error) {
      console.error('exportExamPDF error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: error.message,
        });
      }
    }
  },

};

module.exports = examController;
