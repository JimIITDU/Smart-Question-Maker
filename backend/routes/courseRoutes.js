const express = require('express');
const router = express.Router();
const courseModel = require('../models/courseModel');
const courseEnrollmentModel = require('../models/courseEnrollmentModel');
const teacherModel = require('../models/teacherModel');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const teacherAssignmentMiddleware = require('../middleware/teacherAssignmentMiddleware');

// Middleware: Coaching Admin or Super Admin only
const adminAuth = [authMiddleware, roleMiddleware(2, 1)];

// GET /api/courses - Browse courses (public/student)
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const courses = await courseModel.browseCourses(filters);
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses - Create course (Coaching Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const course = await courseModel.createCourse(req.body, coaching_center_id);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/courses/admin - Get center's courses (Coaching Admin)
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const courses = await courseModel.getCoursesByCenter(coaching_center_id, req.query.status);
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/courses/:id - Course detail
router.get('/:id', async (req, res) => {
  try {
    const course = await courseModel.getCourseDetail(parseInt(req.params.id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/courses/:id - Update course (Coaching Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const course = await courseModel.updateCourse(parseInt(req.params.id), req.body, coaching_center_id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PATCH /api/courses/:id/lifecycle - Update lifecycle status
router.patch('/:id/lifecycle', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const coaching_center_id = req.user.coaching_center_id;
    await courseModel.updateLifecycleStatus(parseInt(req.params.id), status, coaching_center_id);
    res.json({ success: true, message: `Course status updated to ${status}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:id/enroll/private - Manual enrollment (private courses)
router.post('/:id/enroll/private', [authMiddleware, roleMiddleware('coaching_admin')], async (req, res) => {
  try {
    const { student_id } = req.body;
    const course_id = parseInt(req.params.id);
    const coaching_center_id = req.user.coaching_center_id;
    const enrollment = await courseModel.manualEnrollStudent(course_id, student_id, coaching_center_id);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:id/enroll-code - Generate private enrollment code
router.post('/:id/enroll-code', adminAuth, async (req, res) => {
  try {
    const course_id = parseInt(req.params.id);
    const coaching_center_id = req.user.coaching_center_id;
    const code = await courseModel.generatePrivateCode(course_id, coaching_center_id);
    res.json({ success: true, data: { private_enroll_code: code } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/admin/:id - Delete course (Coaching Admin)
router.delete('/admin/:id', adminAuth, require('../controllers/courseController').deleteCourse);

module.exports = router;


