const courseModel = require('../models/courseModel');

// Browse courses (students/public)
const browseCourses = async (req, res) => {
  try {
    const courses = await courseModel.browseCourses(req.query);
    res.json({ success: true, data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create course (Coaching Admin)
const createCourse = async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const course = await courseModel.createCourse(req.body, coaching_center_id);
    res.status(201).json({ success: true, message: 'Course created successfully', data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get admin courses
const getAdminCourses = async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const statusFilter = req.query.status;
    const courses = await courseModel.getCoursesByCenter(coaching_center_id, statusFilter);
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course detail
const getCourseDetail = async (req, res) => {
  try {
    const course = await courseModel.getCourseDetail(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const course = await courseModel.updateCourse(req.params.id, req.body, coaching_center_id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course updated', data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update lifecycle status
const updateLifecycleStatus = async (req, res) => {
  try {
    const coaching_center_id = req.user.coaching_center_id;
    const status = req.body.status;
    await courseModel.updateLifecycleStatus(req.params.id, status, coaching_center_id);
    res.json({ success: true, message: `Course status changed to ${status}` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Manual enroll student (private courses)
const manualEnrollStudent = async (req, res) => {
  try {
    const { student_id } = req.body;
    const course_id = req.params.id;
    const coaching_center_id = req.user.coaching_center_id;
    const enrollment = await courseModel.manualEnrollStudent(course_id, student_id, coaching_center_id);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate private enrollment code
const generatePrivateEnrollCode = async (req, res) => {
  try {
    const course_id = req.params.id;
    const coaching_center_id = req.user.coaching_center_id;
    const code = await courseModel.generatePrivateCode(course_id, coaching_center_id);
    res.json({ success: true, data: { private_enroll_code: code } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete course (Coaching Admin)
const deleteCourse = async (req, res) => {
  try {
    const course_id = parseInt(req.params.id);
    const coaching_center_id = req.user.coaching_center_id;
    await courseModel.deleteCourse(course_id, coaching_center_id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  browseCourses,
  createCourse,
  getAdminCourses,
  getCourseDetail,
  updateCourse,
  updateLifecycleStatus,
  manualEnrollStudent,
  generatePrivateEnrollCode,
  deleteCourse
};


