const academicModel = require("../models/academicModel");
const centerModel = require("../models/centerModel");

const academicController = {
  // ==================
  // COURSE CONTROLLERS
  // ==================

  createCourse: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const courseId = await academicModel.createCourse({
        coaching_center_id: center.coaching_center_id,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: { course_id: courseId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getAllCourses: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const courses = await academicModel.getAllCourses(
        center.coaching_center_id,
      );

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getActiveCourses: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const courses = await academicModel.getActiveCourses(
        center.coaching_center_id,
      );

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getCoursesForTeacher: async (req, res) => {
    try {
      if (req.user.role_id !== 3) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only teachers can view assigned courses.",
        });
      }

      const courses = await academicModel.getCoursesForTeacher(
        req.user.user_id,
      );

      res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getCourseById: async (req, res) => {
    try {
      const course = await academicModel.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getCourseWithDetails: async (req, res) => {
    try {
      const course = await academicModel.getCourseWithDetails(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  updateCourse: async (req, res) => {
    try {
      const course = await academicModel.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      await academicModel.updateCourse(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const course = await academicModel.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      await academicModel.deleteCourse(req.params.id);

      res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // ==================
  // BATCH CONTROLLERS
  // ==================

  createBatch: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const batchId = await academicModel.createBatch({
        coaching_center_id: center.coaching_center_id,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Batch created successfully",
        data: { batch_id: batchId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getAllBatches: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const batches = await academicModel.getAllBatches(
        center.coaching_center_id,
      );

      res.status(200).json({
        success: true,
        data: batches,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getBatchById: async (req, res) => {
    try {
      const batch = await academicModel.getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }
      res.status(200).json({
        success: true,
        data: batch,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  updateBatch: async (req, res) => {
    try {
      const batch = await academicModel.getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      await academicModel.updateBatch(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "Batch updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  deleteBatch: async (req, res) => {
    try {
      const batch = await academicModel.getBatchById(req.params.id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      await academicModel.deleteBatch(req.params.id);

      res.status(200).json({
        success: true,
        message: "Batch deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // ====================
  // SUBJECT CONTROLLERS
  // ====================

  createSubject: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const subjectId = await academicModel.createSubject({
        coaching_center_id: center.coaching_center_id,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Subject created successfully",
        data: { subject_id: subjectId },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getAllSubjects: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "You do not have a coaching center",
        });
      }

      const subjects = await academicModel.getAllSubjects(
        center.coaching_center_id,
      );

      res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getSubjectById: async (req, res) => {
    try {
      const subject = await academicModel.getSubjectById(req.params.id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }
      res.status(200).json({
        success: true,
        data: subject,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  updateSubject: async (req, res) => {
    try {
      const subject = await academicModel.getSubjectById(req.params.id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      await academicModel.updateSubject(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "Subject updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  deleteSubject: async (req, res) => {
    try {
      const subject = await academicModel.getSubjectById(req.params.id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      await academicModel.deleteSubject(req.params.id);

      res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  // ========================
  // ENROLLMENT CONTROLLERS
  // ========================

  enrollStudent: async (req, res) => {
    try {
      const { batch_id, user_id } = req.body;

      const batch = await academicModel.getBatchById(batch_id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: "Batch not found",
        });
      }

      if (batch.current_students >= batch.max_students) {
        return res.status(400).json({
          success: false,
          message: "Batch is full",
        });
      }

      await academicModel.enrollStudent(batch_id, user_id);

      res.status(200).json({
        success: true,
        message: "Student enrolled successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },

  getStudentsInBatch: async (req, res) => {
    try {
      const students = await academicModel.getStudentsInBatch(req.params.id);
      res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
};

module.exports = academicController;
