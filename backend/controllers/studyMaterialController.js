const studyMaterialModel = require('../models/studyMaterialModel');

const studyMaterialController = {
  uploadMaterials: async (req, res) => {
    try {
      const teacher_id = req.user.user_id;
      const coaching_center_id = req.user.coaching_center_id;
      const course_id = req.body.course_id;

      if (!course_id) {
        return res.status(400).json({ success: false, message: 'Course ID required' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      const results = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const material = await studyMaterialModel.createStudyMaterial({
          title: req.body.title || `Material ${i + 1}`,
          description: req.body.description || '',
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size
        }, coaching_center_id, teacher_id);

        results.push(material);
      }

      res.json({ 
        success: true, 
        message: `${results.length} materials uploaded`,
        data: results 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCourseMaterials: async (req, res) => {
    try {
      const course_id = req.params.courseId;
      const materials = await studyMaterialModel.getMaterialsByCourse(course_id);
      res.json({ success: true, data: materials });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getTeacherMaterials: async (req, res) => {
    try {
      const teacher_id = req.user.user_id;
      const coaching_center_id = req.user.coaching_center_id;
      const materials = await studyMaterialModel.getTeacherMaterials(teacher_id, coaching_center_id);
      res.json({ success: true, data: materials });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteMaterial: async (req, res) => {
    try {
      const material_id = req.params.id;
      const teacher_id = req.user.user_id;
      await studyMaterialModel.deleteStudyMaterial(material_id, teacher_id);
      res.json({ success: true, message: 'Material deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

module.exports = studyMaterialController;

