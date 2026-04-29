const questionModel = require('../models/questionModel');

const questionController = {

  createQuestion: async (req, res) => {
    try {
      const questionId = await questionModel.createQuestion({
        ...req.body,
        coaching_center_id: req.user.coaching_center_id,
        created_by: req.user.user_id,
        source: 'manual',
      });

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: { question_id: questionId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getAllQuestions: async (req, res) => {
    try {
      const filters = {
        coaching_center_id: req.user.coaching_center_id,
        subject_id: req.query.subject_id,
        course_id: req.query.course_id,
        difficulty: req.query.difficulty,
        question_type: req.query.question_type,
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
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getQuestionById: async (req, res) => {
    try {
      const question = await questionModel.getQuestionById(
        req.params.id
      );
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }
      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  updateQuestion: async (req, res) => {
    try {
      const question = await questionModel.getQuestionById(
        req.params.id
      );
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      await questionModel.updateQuestion(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Question updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  deleteQuestion: async (req, res) => {
    try {
      const question = await questionModel.getQuestionById(
        req.params.id
      );
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      await questionModel.deleteQuestion(req.params.id);

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
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
          message: 'No questions provided',
        });
      }

      const questionsWithUser = questions.map((q) => ({
        ...q,
        coaching_center_id: req.user.coaching_center_id,
        created_by: req.user.user_id,
        source: 'manual',
      }));

      const ids = await questionModel.bulkCreateQuestions(
        questionsWithUser
      );

      res.status(201).json({
        success: true,
        message: `${ids.length} questions created successfully`,
        data: { question_ids: ids },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  getRandomQuestions: async (req, res) => {
    try {
      const { subject_id, difficulty, limit } = req.query;

      const questions = await questionModel.getRandomQuestions(
        req.user.coaching_center_id,
        subject_id,
        difficulty,
        parseInt(limit) || 10
      );

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

};

module.exports = questionController;
