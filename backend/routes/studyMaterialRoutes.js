const express = require('express');
const router = express.Router();
const studyMaterialController = require('../controllers/studyMaterialController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Middleware stack
const teacherAuth = [authMiddleware, roleMiddleware(3)]; // Teacher only

// POST /api/study-materials/upload - Upload multiple files (multer.array already applied in controller)
router.post('/upload', authMiddleware, roleMiddleware(3), studyMaterialController.uploadMaterials);

// GET /api/study-materials/course/:courseId - Get course materials (students)
router.get('/course/:courseId', authMiddleware, studyMaterialController.getCourseMaterials);

// GET /api/study-materials/teacher - Get teacher's materials
router.get('/teacher', teacherAuth, studyMaterialController.getTeacherMaterials);

// DELETE /api/study-materials/:id - Delete material (teacher only)
router.delete('/:id', teacherAuth, studyMaterialController.deleteMaterial);

module.exports = router;

