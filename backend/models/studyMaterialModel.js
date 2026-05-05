const db = require("../config/db");

const studyMaterialModel = {
  // Create study material (teacher upload)
  createStudyMaterial: async (data, coaching_center_id, teacher_id) => {
    const {
      course_id,
      title,
      description,
      file_path,
      file_type,
      file_size
    } = data;

    const result = await db.query(`
      INSERT INTO study_materials (
        coaching_center_id, course_id, teacher_id, title, description,
        file_path, file_type, file_size, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
      RETURNING *
    `, [
      coaching_center_id,
      course_id,
      teacher_id,
      title || `Material ${new Date().toLocaleDateString()}`,
      description || '',
      file_path,
      file_type,
      file_size
    ]);

    return result.rows[0];
  },

  // Get materials by course (for students)
  getMaterialsByCourse: async (course_id) => {
    const result = await db.query(`
      SELECT sm.*, u.name as teacher_name, c.course_title
      FROM study_materials sm
      JOIN users u ON sm.teacher_id = u.user_id
      JOIN course c ON sm.course_id = c.course_id
      WHERE sm.course_id = $1 AND sm.status = 'active'
      ORDER BY sm.created_at DESC
    `, [course_id]);
    return result.rows;
  },

  // Get teacher's materials
  getTeacherMaterials: async (teacher_id, coaching_center_id) => {
    const result = await db.query(`
      SELECT sm.*, c.course_title
      FROM study_materials sm
      JOIN course c ON sm.course_id = c.course_id
      WHERE sm.teacher_id = $1 AND sm.coaching_center_id = $2 AND sm.status = 'active'
      ORDER BY sm.created_at DESC
    `, [teacher_id, coaching_center_id]);
    return result.rows;
  },

  // Delete study material (soft delete)
  deleteStudyMaterial: async (material_id, teacher_id) => {
    await db.query(`
      UPDATE study_materials 
      SET status = 'deleted', deleted_at = NOW()
      WHERE material_id = $1 AND teacher_id = $2
    `, [material_id, teacher_id]);
  }
};

module.exports = studyMaterialModel;

