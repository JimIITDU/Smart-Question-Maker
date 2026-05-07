const centerModel = require('../models/centerModel');
const db = require('../config/db');
const academicModel = require('../models/academicModel');
const examModel = require('../models/examModel');
const questionModel = require('../models/questionModel');
const courseEnrollmentModel = require('../models/courseEnrollmentModel');

const coachingAnalyticsController = {
  /**
   * Coaching Admin analytics page data (single payload)
   */
  getAnalytics: async (req, res) => {
    try {
      const center = await centerModel.getCenterByUserId(req.user.user_id);
      if (!center) {
        return res.status(404).json({ success: false, message: 'Coaching center not found' });
      }

      const coaching_center_id = center.coaching_center_id;

        const [statsRows, examPerfRows, studentsPerBatchRows, recentExamResultsRows] =
        await Promise.all([
          // Stats for top cards
          db.query(
            `
              SELECT
                (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.coaching_center_id = $1 AND ce.status='active')::int AS total_students,
                (SELECT COUNT(DISTINCT ta.teacher_id) FROM teacher_course_assignments ta WHERE ta.coaching_center_id = $1)::int AS total_teachers,
                (SELECT COUNT(*) FROM course c WHERE c.coaching_center_id = $1)::int AS active_courses,
                (SELECT COUNT(*) FROM quiz_exam q WHERE q.coaching_center_id = $1 AND q.status IN ('completed','ongoing'))::int AS exams_conducted
            `,
            [coaching_center_id]
          ),

          // Exam performance chart - average score per exam (percentage)
          db.query(
            `
              SELECT
                q.created_at as exam_date,
                q.exam_id,
                AVG(
                  COALESCE(rs.marks_obtained::float / GREATEST(qb.max_marks,1) * 100,0)
                ) as avg_percentage,
                AVG(rs.marks_obtained)::float as avg_score
              FROM quiz_exam q
              JOIN result_summary rs ON rs.exam_id = q.exam_id
              JOIN question_bank qb ON qb.question_id = rs.question_id
              WHERE q.coaching_center_id = $1
              GROUP BY q.exam_id, q.created_at
              ORDER BY q.created_at DESC
              LIMIT 10
            `,
            [coaching_center_id]
          ),

          // Students per batch chart
          db.query(
            `
              SELECT
                b.batch_name,
                COUNT(DISTINCT ce.student_id)::int as student_count
              FROM batch b
              JOIN quiz_exam q ON q.batch_id = b.batch_id
              JOIN result_summary rs ON rs.exam_id = q.exam_id
              JOIN course_enrollments ce ON ce.student_id = rs.student_id AND ce.coaching_center_id = $1
              WHERE b.coaching_center_id = $1
              GROUP BY b.batch_id, b.batch_name
              ORDER BY student_count DESC
              LIMIT 10
            `,
            [coaching_center_id]
          ),

          // Recent exam results table
          db.query(
            `
              SELECT
                q.exam_id,
                q.title as exam_name,
                c.course_title,
                q.created_at as date,
                COUNT(DISTINCT rs.student_id)::int as students_tested,
                AVG(rs.marks_obtained::float / GREATEST(qb.max_marks,1) * 100) as avg_percentage,
                (COUNT(CASE WHEN rs.marks_obtained::float / GREATEST(qb.max_marks,1) * 100 >= 50 THEN 1 END)::float
                  / NULLIF(COUNT(DISTINCT rs.student_id),0) * 100) as pass_rate
              FROM quiz_exam q
              JOIN course c ON c.course_id = q.course_id
              JOIN result_summary rs ON rs.exam_id = q.exam_id
              JOIN question_bank qb ON qb.question_id = rs.question_id
              WHERE q.coaching_center_id = $1
              GROUP BY q.exam_id, c.course_title
              ORDER BY q.created_at DESC
              LIMIT 10
            `,
            [coaching_center_id]
          )
        ]);

      const stats = statsRows.rows?.[0] || {};

      const exam_performance = (examPerfRows.rows || []).map(r => ({
        exam_date: r.exam_date,
        avg_percentage: Number(r.avg_percentage || 0),
        avg_score: Number(r.avg_score || 0),
        exam_id: r.exam_id,
      }));

      const students_per_batch = (studentsPerBatchRows.rows || []).map(r => ({
        batch_name: r.batch_name,
        student_count: Number(r.student_count || 0)
      }));

      const recent_exam_results = (recentExamResultsRows.rows || []).map(r => ({
        exam_id: r.exam_id,
        exam_name: r.exam_name,
        course_title: r.course_title,
        date: r.date,
        students_tested: r.students_tested,
        avg_percentage: Number(r.avg_percentage || 0),
        pass_rate: Number(r.pass_rate || 0)
      }));

      return res.json({
        success: true,
        data: {
          stats: {
            total_students: stats.total_students || 0,
            total_teachers: stats.total_teachers || 0,
            active_courses: stats.active_courses || 0,
            exams_conducted: stats.exams_conducted || 0,
          },
          exam_performance,
          students_per_batch,
          recent_exam_results,
        },
      });
    } catch (error) {
      console.error('getAnalytics error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  /**
   * Get comprehensive dashboard stats for coaching center
   * Optimized with parallel queries
   */
  // Backward-compatible / old exports
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
          db.query('SELECT COUNT(*) as count FROM courses WHERE coaching_center_id = $1', [coaching_center_id]),
          db.query('SELECT COUNT(*) as count FROM batch WHERE coaching_center_id = $1', [coaching_center_id]),
          db.query('SELECT COUNT(*) as count FROM subjects WHERE coaching_center_id = $1', [coaching_center_id]),
          db.query(`
            SELECT COUNT(DISTINCT t.user_id) as count 
            FROM teacher_assignments ta 
            JOIN users t ON ta.teacher_user_id = t.user_id 
            WHERE ta.coaching_center_id = $1
          `, [coaching_center_id]),
          db.query(`
            SELECT COUNT(DISTINCT ce.student_id) as count 
            FROM course_enrollments ce 
            WHERE ce.coaching_center_id = $1 AND ce.status = 'active'
          `, [coaching_center_id]),
          db.query('SELECT COUNT(*) as count FROM quiz_exam WHERE coaching_center_id = $1', [coaching_center_id]),
          db.query('SELECT COUNT(*) as count FROM course_enrollments WHERE coaching_center_id = $1 AND status = \'active\'', [coaching_center_id]),
          db.query(`
            SELECT COALESCE(SUM(price), 0) as revenue 
            FROM course_enrollments 
            WHERE coaching_center_id = $1 
            AND status = 'active' 
            AND enrollment_date >= NOW() - INTERVAL '30 days'
          `, [coaching_center_id]),
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

  getExamPerformance: async (req, res) => {
    try {
      const { period = '30' } = req.query;
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
