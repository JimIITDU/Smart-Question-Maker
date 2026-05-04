const db = require("../config/db");

const courseModel = {
  // Create course (Coaching Admin only)
  createCourse: async (data, coaching_center_id) => {
    const {
      course_title, course_description, category, class_level, subjects_covered,
      duration, fee, start_date, end_date, enrollment_type, max_students,
      thumbnail, is_public = true
    } = data;

    const result = await db.query(`
      INSERT INTO course (
        coaching_center_id, course_title, course_description, 
        category, class_level, subjects_covered, duration, fee,
        start_date, end_date, enrollment_type, max_students,
        thumbnail, is_public, lifecycle_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'draft')
      RETURNING *
    `, [
      coaching_center_id, course_title, course_description,
      category || null, class_level || null, subjects_covered || '[]',
      duration, fee || 0, start_date, end_date || null,
      enrollment_type || 'open', max_students || null,
      thumbnail || null, is_public
    ]);

    return result.rows[0];
  },

  // Update course
  updateCourse: async (course_id, data, coaching_center_id) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updates = {
      course_title: '$1', course_description: '$2', category: '$3',
      class_level: '$4', subjects_covered: '$5', duration: '$6',
      fee: '$7', start_date: '$8', end_date: '$9',
      enrollment_type: '$10', max_students: '$11', thumbnail: '$12',
      is_public: '$13'
    };

    Object.keys(updates).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(data[key]);
        paramIndex++;
      }
    });

    values.push(course_id, coaching_center_id);

    if (fields.length === 0) throw new Error('No fields to update');

    const query = `
      UPDATE course SET ${fields.join(', ')}, updated_at = NOW()
      WHERE course_id = $${paramIndex-1} AND coaching_center_id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Get all courses by center (admin view)
  getCoursesByCenter: async (coaching_center_id, statusFilter = null) => {
    let query = `
      SELECT c.*, 
        COUNT(ce.student_id) as enrollment_count,
        COUNT(tca.teacher_id) as teacher_count,
        COUNT(qe.exam_id) as exam_count
      FROM course c
      LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id AND ce.status = 'active'
      LEFT JOIN teacher_course_assignments tca ON c.course_id = tca.course_id AND tca.status = 'active'
      LEFT JOIN quiz_exam qe ON c.course_id = qe.course_id
      WHERE c.coaching_center_id = $1
    `;
    const params = [coaching_center_id];

    if (statusFilter) {
      query += ` AND c.lifecycle_status = $2`;
      params.push(statusFilter);
    }

    query += ` GROUP BY c.course_id ORDER BY c.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  },

  // Browse courses (student/public view)
  browseCourses: async (filters = {}) => {
    const { search, category, class_level, fee_min, fee_max, lifecycle_status } = filters;
    
    let params = [];
    let conditions = ["c.lifecycle_status IN ('published', 'active')"];

    if (search) {
      conditions.push(`(c.course_title ILIKE $${params.length + 1} OR c.course_description ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    if (category) {
      conditions.push(`c.category = $${params.length + 1}`);
      params.push(category);
    }
    if (class_level) {
      conditions.push(`c.class_level ILIKE $${params.length + 1}`);
      params.push(`%${class_level}%`);
    }
    if (fee_min) {
      conditions.push(`c.fee >= $${params.length + 1}`);
      params.push(parseFloat(fee_min));
    }
    if (fee_max) {
      conditions.push(`c.fee <= $${params.length + 1}`);
      params.push(parseFloat(fee_max));
    }
    if (lifecycle_status) {
      conditions.push(`c.lifecycle_status = $${params.length + 1}`);
      params.push(lifecycle_status);
    }

    const query = `
      SELECT c.*, cc.center_name,
        COUNT(tca.teacher_id) as teacher_count
      FROM course c
      JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
      LEFT JOIN teacher_course_assignments tca ON c.course_id = tca.course_id AND tca.status = 'active'
      WHERE ${conditions.join(' AND ')} AND c.is_public = true
      GROUP BY c.course_id, cc.center_name
      ORDER BY c.created_at DESC
    `;

    const result = await db.query(query, params);
    return result.rows;
  },

  // Get single course detail (with teachers, enrollment count, exams summary)
  getCourseDetail: async (course_id) => {
    const result = await db.query(`
      SELECT c.*, cc.center_name, cc.location,
        COALESCE(enroll_count, 0) as enrollment_count,
        COALESCE(teacher_count, 0) as teacher_count
      FROM course c
      JOIN coaching_center cc ON c.coaching_center_id = cc.coaching_center_id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enroll_count 
        FROM course_enrollments WHERE status = 'active' GROUP BY course_id
      ) e ON c.course_id = e.course_id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as teacher_count
        FROM teacher_course_assignments WHERE status = 'active' GROUP BY course_id
      ) t ON c.course_id = t.course_id
      WHERE c.course_id = $1
    `, [course_id]);

    if (result.rows.length === 0) return null;

    const course = result.rows[0];

    // Get assigned teachers with subjects
    course.teachers = await db.query(`
      SELECT u.user_id, u.name, u.email, u.profile_image, u.subject_specialization,
        s.subject_name, tca.subject_id
      FROM teacher_course_assignments tca
      JOIN users u ON tca.teacher_id = u.user_id
      LEFT JOIN subjects s ON tca.subject_id = s.subject_id
      WHERE tca.course_id = $1 AND tca.status = 'active'
      ORDER BY u.name
    `, [course_id]).then(r => r.rows);

    // Exam summary by type
    course.exams_summary = await db.query(`
      SELECT exam_type, COUNT(*) as count,
        STRING_AGG(title, ', ' ORDER BY created_at DESC) as titles
      FROM quiz_exam WHERE course_id = $1
      GROUP BY exam_type
    `, [course_id]).then(r => r.rows);

    return course;
  },

  // Update lifecycle status
  updateLifecycleStatus: async (course_id, status, coaching_center_id) => {
    // Auto transitions
    const allowed = {
      'draft': ['published'],
      'published': ['active', 'draft'],
      'active': ['completed', 'published'],
      'completed': ['archived'],
      'archived': []
    };

    const current = await db.query('SELECT lifecycle_status FROM course WHERE course_id = $1 AND coaching_center_id = $2', [course_id, coaching_center_id]);
    if (current.rows.length === 0) throw new Error('Course not found');
    
    if (!allowed[current.rows[0].lifecycle_status]?.includes(status)) {
      throw new Error(`Invalid transition from ${current.rows[0].lifecycle_status} to ${status}`);
    }

    await db.query(
      'UPDATE course SET lifecycle_status = $1 WHERE course_id = $2 AND coaching_center_id = $3',
      [status, course_id, coaching_center_id]
    );
  },

  // Private manual enrollment
  manualEnrollStudent: async (course_id, student_id, coaching_center_id) => {
    // Check capacity
    const currentCount = await db.query(
      `SELECT COUNT(*) as count FROM course_enrollments WHERE course_id = $1 AND status = 'active'`,
      [course_id]
    );
    
    const course = await db.query('SELECT max_students FROM course WHERE course_id = $1', [course_id]);
    if (course.rows[0].max_students && parseInt(currentCount.rows[0].count) >= course.rows[0].max_students) {
      throw new Error('Course is full');
    }

    // Insert enrollment (free/private)
    const result = await db.query(`
      INSERT INTO course_enrollments (student_id, course_id, coaching_center_id, status, payment_status)
      VALUES ($1, $2, $3, 'active', 'paid')
      RETURNING *
    `, [student_id, course_id, coaching_center_id]);

    return result.rows[0];
  },

  // Get private enrollment code
  generatePrivateCode: async (course_id, coaching_center_id) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await db.query(
      'UPDATE course SET private_enroll_code = $1 WHERE course_id = $2 AND coaching_center_id = $3',
      [code, course_id, coaching_center_id]
    );
    return code;
  },

  // Delete course (soft delete for Coaching Admin)
  deleteCourse: async (course_id, coaching_center_id) => {
    const result = await db.query(`
      UPDATE course 
      SET lifecycle_status = 'deleted', deleted_at = NOW()
      WHERE course_id = $1 AND coaching_center_id = $2
      RETURNING course_id
    `, [course_id, coaching_center_id]);
    
    if (result.rows.length === 0) {
      throw new Error('Course not found or unauthorized');
    }
    return true;
  }
};

module.exports = courseModel;

