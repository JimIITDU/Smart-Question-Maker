const examModel = require('../models/examModel');
const questionModel = require('../models/questionModel');

const examController = {

  // Create exam
  createExam: async (req, res) => {
    try {
      const {
        subject_id,
        batch_id,
        exam_type,
        start_time,
        end_time,
        question_ids,
      } = req.body;

      // Generate access code for live quiz
      const access_code = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const examId = await examModel.createExam({
        subject_id,
        batch_id,
        exam_type,
        host_teacher_id: req.user.user_id,
        start_time,
        end_time,
        access_code,
      });

      // Add questions to exam
      if (question_ids && question_ids.length > 0) {
        await examModel.addQuestionsToExam(examId, question_ids);
      }

      res.status(201).json({
        success: true,
        message: 'Exam created successfully',
        data: {
          exam_id: examId,
          access_code,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get all exams
  getAllExams: async (req, res) => {
    try {
      const exams = await examModel.getAllExams(
        req.user.user_id
      );
      res.status(200).json({
        success: true,
        count: exams.length,
        data: exams,
      });
    } catch (error) {
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
      const { answers } = req.body;
      const exam_id = req.params.id;

      const exam = await examModel.getExamById(exam_id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found',
        });
      }

      let totalMarks = 0;
      let obtainedMarks = 0;

      for (const answer of answers) {
        const question = await questionModel.getQuestionById(
          answer.question_id
        );

        let marks_obtained = 0;

        // Auto grade MCQ
        if (question.question_type === 'mcq') {
          if (answer.selected_option === question.correct_option) {
            marks_obtained = question.max_marks;
          }
        }

        totalMarks += question.max_marks;
        obtainedMarks += marks_obtained;

        await examModel.submitAnswer({
          exam_id,
          student_id: req.user.user_id,
          question_id: answer.question_id,
          descriptive_answer: answer.descriptive_answer || null,
          marks_obtained,
          evaluated_by: question.question_type === 'mcq'
            ? 'teacher'
            : 'llm',
        });
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
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

};

module.exports = examController;