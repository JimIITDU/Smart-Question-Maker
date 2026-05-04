const centerModel = require('../models/centerModel');
const db = require('../config/db');
const academicModel = require('../models/academicModel');
const examModel = require('../models/examModel');
const questionModel = require('../models/questionModel');
const courseEnrollmentModel = require('../models/courseEnrollmentModel');

const coachingAnalyticsController = {
  /**
   * Get comprehensive dashboard stats for coaching center
   * Optimized with parallel queries
   */
  getDashboardStats: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({
          success: false,
          message: "Coaching center not found"
        });
      }

      const coaching_center_id = center.coaching_center_id;

      // Parallel stats queries
      const [courseCount, batchCount, subjectCount, teacherCount, studentCount, 
             examCount, enrollmentCount, revenue, topSubjects, recentExams] = 
        await Promise.all([
          // Total courses
          db.query('SELECT COUNT(*) as count FROM courses WHERE coaching_center_id = $1', [coaching_center_id]),
          
          // Total batches  
          db.query('SELECT COUNT(*) as count FROM batch WHERE coaching_center_id = $1', [coaching_center_id]),
          
          // Total subjects
          db.query('SELECT COUNT(*) as count FROM subjects WHERE coaching_center_id = $1', [coaching_center_id]),
          
          // Assigned teachers
          db.query(`
            SELECT COUNT(DISTINCT t.user_id) as count 
            FROM teacher_assignments ta 
            JOIN users t ON ta.teacher_user_id = t.user_id 
            WHERE ta.coaching_center_id = $1
          `, [coaching_center_id]),
          
          // Active students (enrolled)
          db.query(`
            SELECT COUNT(DISTINCT ce.student_id) as count 
            FROM course_enrollments ce 
            WHERE ce.coaching_center_id = $1 AND ce.status = 'active'
          `, [coaching_center_id]),
          
          // Total exams conducted
          db.query('SELECT COUNT(*) as count FROM quiz_exam WHERE coaching_center_id = $1', [coaching_center_id]),
          
          // Active enrollments
          db.query('SELECT COUNT(*) as count FROM course_enrollments WHERE coaching_center_id = $1 AND status = \'active\'', [coaching_center_id]),
          
          // Monthly revenue (from subscriptions/enrollments)
          db.query(`
            SELECT COALESCE(SUM(price), 0) as revenue 
            FROM course_enrollments 
            WHERE coaching_center_id = $1 
            AND status = 'active' 
            AND enrollment_date >= NOW() - INTERVAL '30 days'
          `, [coaching_center_id]),
          
          // Top 5 subjects by enrollments
          db.query(`
            SELECT s.subject_name, COUNT(ce.*) as enrollment_count
            FROM subjects s
            JOIN courses c ON s.subject_id = c.subject_id
            JOIN course_enrollments ce ON c.course_id = ce.course_id
            WHERE s.coaching_center_id = $1 AND ce.status = 'active'
            GROUP BY s.subject_id, s.subject_name
            ORDER BY enrollment_count DESC
            LIMIT 5
          `, [coaching_center_id]),
          
          // Recent 10 exams
          db.query(`
            SELECT exam_id, title, exam_type, status, created_at,
                   COUNT(eq.question_id) as question_count
            FROM quiz_exam q
            LEFT JOIN exam_questions eq ON q.exam_id = eq.exam_id
            WHERE q.coaching_center_id = $1
            GROUP BY q.exam_id
            ORDER BY q.created_at DESC
            LIMIT 10
          `, [coaching_center_id])
        ]);

      res.status(200).json({
        success: true,
        data: {
          center: center,
          stats: {
            courses: parseInt(courseCount.rows[0].count),
            batches: parseInt(batchCount.rows[0].count),
            subjects: parseInt(subjectCount.rows[0].count),
            teachers: parseInt(teacherCount.rows[0].count),
            students: parseInt(studentCount.rows[0].count),
            exams: parseInt(examCount.rows[0].count),
            enrollments: parseInt(enrollmentCount.rows[0].count),
            revenue: parseFloat(revenue.rows[0].revenue),
            topSubjects: topSubjects.rows,
            recentExams: recentExams.rows
          }
        }
      });

    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get exam performance analytics
   */
  getExamPerformance: async (req, res) => {
    try {
      const { period = '30' } = req.query; // days
      const coaching_center_id = (await centerModel.getCenterByUserId(req.user.user_id))?.coaching_center_id;

      const stats = await db.query(`
        SELECT 
          DATE_TRUNC('day', rs.evaluated_at) as exam_date,
          COUNT(DISTINCT rs.student_id) as students_tested,
          AVG(rs.marks_obtained::float / GREATEST(qb.max_marks, 1) * 100) as avg_percentage,
          COUNT(CASE WHEN rs.marks_obtained::float / GREATEST(qb.max_marks, 1) * 100 >= 50 THEN 1 END) as pass_count,
          COUNT(rs.result_id) as total_questions
        FROM result_summary rs
        JOIN question_bank qb ON rs.question_id = qb.question_id
        JOIN quiz_exam q ON rs.exam_id = q.exam_id
        WHERE q.coaching_center_id = $1
        AND rs.evaluated_at >= NOW() - INTERVAL '${period} days'
        GROUP BY DATE_TRUNC('day', rs.evaluated_at)
        ORDER BY exam_date DESC
      `, [coaching_center_id]);

      res.json({
        success: true,
        data: stats.rows,
        period: parseInt(period)
      });

    } catch (error) {
      console.error("Exam performance error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /**
   * Course enrollment trends
   */
  getEnrollmentTrends: async (req, res) => {
    try {
      const coaching_center_id = (await centerModel.getCenterByUserId(req.user.user_id))?.coaching_center_id;

      const trends = await db.query(`
        SELECT 
          DATE_TRUNC('month', enrollment_date) as month,
          COUNT(*) as new_enrollments,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_enrollments
        FROM course_enrollments 
        WHERE coaching_center_id = $1
        GROUP BY DATE_TRUNC('month', enrollment_date)
        ORDER BY month DESC
        LIMIT 12
      `, [coaching_center_id]);

      res.json({
        success: true,
        data: trends.rows
      });

    } catch (error) {
      console.error("Enrollment trends error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /**
   * Teacher performance (exams created vs conducted)
   */
  getTeacherPerformance: async (req, res) => {
    try {
      const coaching_center_id = (await centerModel.getCenterByUserId(req.user.user_id))?.coaching_center_id;

      const performance = await db.query(`
        SELECT 
          u.name,
          u.email,
          COUNT(CASE WHEN q.status = 'draft' THEN 1 END) as draft_exams,
          COUNT(CASE WHEN q.status IN ('ongoing', 'completed') THEN 1 END) as conducted_exams,
          COUNT(eq.question_id) as total_questions_created
        FROM users u
        JOIN quiz_exam q ON u.user_id = q.host_teacher_id
        LEFT JOIN exam_questions eq ON q.exam_id = eq.exam_id
        WHERE q.coaching_center_id = $1
        GROUP BY u.user_id, u.name, u.email
        ORDER BY conducted_exams DESC
      `, [coaching_center_id]);

      res.json({
        success: true,
        data: performance.rows
      });

    } catch (error) {
      console.error("Teacher performance error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /**
   * Revenue analytics by subscription plans
   */
  getRevenueAnalytics: async (req, res) => {
    try {
      const coaching_center_id = (await centerModel.getCenterByUserId(req.user.user_id))?.coaching_center_id;

      const revenue = await db.query(`
        SELECT 
          sp.plan_name,
          COUNT(ce.course_id) as enrollments,
          COALESCE(SUM(ce.price), 0) as total_revenue,
          AVG(ce.price) as avg_price
        FROM course_enrollments ce
        JOIN subscription_plans sp ON ce.subscription_plan_id = sp.plan_id
        WHERE ce.coaching_center_id = $1 AND ce.status = 'active'
        GROUP BY sp.plan_id, sp.plan_name
        ORDER BY total_revenue DESC
      `, [coaching_center_id]);

      res.json({
        success: true,
        data: revenue.rows
      });

    } catch (error) {
      console.error("Revenue analytics error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

module.exports = coachingAnalyticsController;

