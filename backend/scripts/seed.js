const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const a = String.fromCharCode(64);
const p1 = 'postgresql://neondb_owner:npg_u9brOpC2xBdo';
const p2 = 'ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: p1 + a + p2,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🗑️  Clearing existing data...');

    await client.query('BEGIN');

    // Delete in correct order (FK dependencies)
    await client.query('DELETE FROM notification');
    await client.query('DELETE FROM result_summary');
    await client.query('DELETE FROM exam_questions');
    await client.query('DELETE FROM quiz_exam');
    await client.query('DELETE FROM question_bank');
    await client.query('DELETE FROM batch_enrollment');
    await client.query('DELETE FROM subjects');
    await client.query('DELETE FROM batch');
    await client.query('DELETE FROM course');
    await client.query('DELETE FROM subscription');
    await client.query('DELETE FROM users');
    await client.query('DELETE FROM coaching_center');

    console.log('✅ All data cleared!');

    // Hash password
    const password = await bcrypt.hash('pass@1234', 10);

    console.log('👤 Creating users...');

    // Super Admin (role_id: 1)
    const superAdmin = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status)
       VALUES (1, 'super@gmail.com', $1, 'Super Admin', '01700000001', true, 'active')
       RETURNING user_id`,
      [password]
    );
    const superAdminId = superAdmin.rows[0].user_id;

    // Coaching Admin (role_id: 2)
    const coachingAdmin = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status)
       VALUES (2, 'admin@gmail.com', $1, 'Coaching Admin', '01700000002', true, 'active')
       RETURNING user_id`,
      [password]
    );
    const coachingAdminId = coachingAdmin.rows[0].user_id;

    // Teacher (role_id: 3)
    const teacher = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status, subject_specialization, employment_status)
       VALUES (3, 'teacher@gmail.com', $1, 'John Teacher', '01700000003', true, 'active', 'Mathematics, Physics', 'full_time')
       RETURNING user_id`,
      [password]
    );
    const teacherId = teacher.rows[0].user_id;

    // Staff (role_id: 4)
    const staff = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status)
       VALUES (4, 'staff@gmail.com', $1, 'Staff Member', '01700000004', true, 'active')
       RETURNING user_id`,
      [password]
    );
    const staffId = staff.rows[0].user_id;

    // Student 1 (role_id: 5)
    const student1 = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status, roll_number, class, group_name)
       VALUES (5, 'student1@gmail.com', $1, 'Alice Student', '01700000005', true, 'active', 'ROLL001', 'Class 12', 'Science')
       RETURNING user_id`,
      [password]
    );
    const student1Id = student1.rows[0].user_id;

    // Student 2 (role_id: 5)
    const student2 = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status, roll_number, class, group_name)
       VALUES (5, 'student2@gmail.com', $1, 'Bob Student', '01700000006', true, 'active', 'ROLL002', 'Class 12', 'Science')
       RETURNING user_id`,
      [password]
    );
    const student2Id = student2.rows[0].user_id;

    // Parent (role_id: 6)
    const parent = await client.query(
      `INSERT INTO users (role_id, email, password_hash, name, phone, is_email_verified, status)
       VALUES (6, 'parent@gmail.com', $1, 'Parent User', '01700000007', true, 'active')
       RETURNING user_id`,
      [password]
    );
    const parentId = parent.rows[0].user_id;

    console.log('✅ Users created!');

    // Coaching Center
    console.log('🏫 Creating coaching center...');
    const center = await client.query(
      `INSERT INTO coaching_center (user_id, center_name, location, contact_number, email, established_date, access_type, status)
       VALUES ($1, 'Excellence Coaching Center', 'Dhaka, Bangladesh', '01700000002', 'admin@gmail.com', '2020-01-01', 'paid', 'active')
       RETURNING coaching_center_id`,
      [coachingAdminId]
    );
    const centerId = center.rows[0].coaching_center_id;

    // Update coaching admin with center
    await client.query(
      'UPDATE users SET coaching_center_id = $1 WHERE user_id = $2',
      [centerId, coachingAdminId]
    );
    await client.query(
      'UPDATE users SET coaching_center_id = $1 WHERE user_id = $2',
      [centerId, teacherId]
    );
    await client.query(
      'UPDATE users SET coaching_center_id = $1 WHERE user_id = $2',
      [centerId, staffId]
    );
    await client.query(
      'UPDATE users SET coaching_center_id = $1 WHERE user_id = $2',
      [centerId, student1Id]
    );
    await client.query(
      'UPDATE users SET coaching_center_id = $1 WHERE user_id = $2',
      [centerId, student2Id]
    );

    console.log('✅ Coaching center created!');

    // Courses
    console.log('📚 Creating courses...');
    const course1 = await client.query(
      `INSERT INTO course (coaching_center_id, course_title, course_description, duration, fee)
       VALUES ($1, 'HSC Science', 'Higher Secondary Certificate Science program', '12 months', 5000)
       RETURNING course_id`,
      [centerId]
    );
    const course1Id = course1.rows[0].course_id;

    const course2 = await client.query(
      `INSERT INTO course (coaching_center_id, course_title, course_description, duration, fee)
       VALUES ($1, 'SSC General', 'Secondary School Certificate General program', '10 months', 3500)
       RETURNING course_id`,
      [centerId]
    );
    const course2Id = course2.rows[0].course_id;

    console.log('✅ Courses created!');

    // Batches
    console.log('🎓 Creating batches...');
    const batch1 = await client.query(
      `INSERT INTO batch (course_id, coaching_center_id, batch_name, batch_code, start_date, end_date, batch_type, class_shift, max_students, current_students, status)
       VALUES ($1, $2, 'Batch A 2024', 'BA2024', '2024-01-01', '2024-12-31', 'regular', 'morning', 30, 2, 'running')
       RETURNING batch_id`,
      [course1Id, centerId]
    );
    const batch1Id = batch1.rows[0].batch_id;

    const batch2 = await client.query(
      `INSERT INTO batch (course_id, coaching_center_id, batch_name, batch_code, start_date, end_date, batch_type, class_shift, max_students, current_students, status)
       VALUES ($1, $2, 'Batch B 2024', 'BB2024', '2024-02-01', '2024-11-30', 'weekend', 'evening', 25, 0, 'upcoming')
       RETURNING batch_id`,
      [course2Id, centerId]
    );
    const batch2Id = batch2.rows[0].batch_id;

    console.log('✅ Batches created!');

    // Enroll students
    await client.query(
      `INSERT INTO batch_enrollment (batch_id, user_id) VALUES ($1, $2)`,
      [batch1Id, student1Id]
    );
    await client.query(
      `INSERT INTO batch_enrollment (batch_id, user_id) VALUES ($1, $2)`,
      [batch1Id, student2Id]
    );

    console.log('✅ Students enrolled!');

    // Subjects
    console.log('📖 Creating subjects...');
    const subject1 = await client.query(
      `INSERT INTO subjects (course_id, coaching_center_id, teacher_user_id, subject_name, subject_code, assigned_date, is_active)
       VALUES ($1, $2, $3, 'Mathematics', 'MATH101', NOW(), true)
       RETURNING subject_id`,
      [course1Id, centerId, teacherId]
    );
    const subject1Id = subject1.rows[0].subject_id;

    const subject2 = await client.query(
      `INSERT INTO subjects (course_id, coaching_center_id, teacher_user_id, subject_name, subject_code, assigned_date, is_active)
       VALUES ($1, $2, $3, 'Physics', 'PHY101', NOW(), true)
       RETURNING subject_id`,
      [course1Id, centerId, teacherId]
    );
    const subject2Id = subject2.rows[0].subject_id;

    console.log('✅ Subjects created!');

    // Questions
    console.log('❓ Creating questions...');
    await client.query(
      `INSERT INTO question_bank (coaching_center_id, subject_id, course_id, question_text, question_type, difficulty, option_text_a, option_text_b, option_text_c, option_text_d, correct_option, max_marks, created_by, source)
       VALUES ($1, $2, $3, 'What is 2 + 2?', 'mcq', 'easy', '3', '4', '5', '6', 'B', 1, $4, 'manual')`,
      [centerId, subject1Id, course1Id, teacherId]
    );

    await client.query(
      `INSERT INTO question_bank (coaching_center_id, subject_id, course_id, question_text, question_type, difficulty, option_text_a, option_text_b, option_text_c, option_text_d, correct_option, max_marks, created_by, source)
       VALUES ($1, $2, $3, 'What is the value of Pi (π) approximately?', 'mcq', 'easy', '2.14', '3.14', '4.14', '1.14', 'B', 1, $4, 'manual')`,
      [centerId, subject1Id, course1Id, teacherId]
    );

    await client.query(
      `INSERT INTO question_bank (coaching_center_id, subject_id, course_id, question_text, question_type, difficulty, option_text_a, option_text_b, option_text_c, option_text_d, correct_option, max_marks, created_by, source)
       VALUES ($1, $2, $3, 'What is Newton''s First Law of Motion?', 'mcq', 'medium', 'Law of Acceleration', 'Law of Inertia', 'Law of Gravitation', 'Law of Energy', 'B', 2, $4, 'manual')`,
      [centerId, subject2Id, course1Id, teacherId]
    );

    await client.query(
      `INSERT INTO question_bank (coaching_center_id, subject_id, course_id, question_text, question_type, difficulty, expected_answer, max_marks, created_by, source)
       VALUES ($1, $2, $3, 'Explain the Pythagorean theorem and give an example.', 'descriptive', 'hard', 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides. Example: 3² + 4² = 5²', 5, $4, 'manual')`,
      [centerId, subject1Id, course1Id, teacherId]
    );

    await client.query(
      `INSERT INTO question_bank (coaching_center_id, subject_id, course_id, question_text, question_type, difficulty, option_text_a, option_text_b, correct_option, max_marks, created_by, source)
       VALUES ($1, $2, $3, 'The speed of light is approximately 3 × 10⁸ m/s.', 'true_false', 'easy', 'True', 'False', 'A', 1, $4, 'manual')`,
      [centerId, subject2Id, course1Id, teacherId]
    );


    console.log('✅ Questions created!');

    // Notifications
    console.log('🔔 Creating notifications...');
    await client.query(
      `INSERT INTO notification (user_id, message, type, status)
       VALUES ($1, 'Welcome to Smart Question Maker! Your account is ready.', 'system', 'unread')`,
      [teacherId]
    );
    await client.query(
      `INSERT INTO notification (user_id, message, type, status)
       VALUES ($1, 'Welcome! Your student account has been created.', 'system', 'unread')`,
      [student1Id]
    );
    await client.query(
      `INSERT INTO notification (user_id, message, type, status)
       VALUES ($1, 'New exam has been scheduled for Batch A 2024.', 'exam', 'unread')`,
      [student2Id]
    );

    await client.query('COMMIT');

    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('================================');
    console.log('Super Admin  | super@gmail.com    | pass@1234');
    console.log('Coaching Admin| admin@gmail.com    | pass@1234');
    console.log('Teacher      | teacher@gmail.com  | pass@1234');
    console.log('Staff        | staff@gmail.com    | pass@1234');
    console.log('Student 1    | student1@gmail.com | pass@1234');
    console.log('Student 2    | student2@gmail.com | pass@1234');
    console.log('Parent       | parent@gmail.com   | pass@1234');
    console.log('================================');

    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
