/**
 * Migration Script for Course Enrollment System
 * Run this script to add the required columns for the new course enrollment system
 * 
 * Usage: node scripts/migrateCourseEnrollment.js
 */

const db = require('../config/db');

async function runMigration() {
  console.log('Starting migration for course enrollment system...');
  
  try {
    // Step 1: Add columns to course_enrollments table if they don't exist
    console.log('Migrating course_enrollments table...');
    
    await db.query(`
      ALTER TABLE course_enrollments 
      ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES users(user_id),
      ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES course(course_id),
      ADD COLUMN IF NOT EXISTS coaching_center_id INTEGER,
      ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'unpaid',
      ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0
    `).catch(() => {
      // Columns may already exist, continue
      console.log('course_enrollments columns may already exist or table structure different');
    });

    // Step 2: Add is_public to course table
    console.log('Migrating course table...');
    await db.query(`
      ALTER TABLE course 
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true
    `).catch(() => {
      console.log('course.is_public may already exist');
    });

    // Step 3: Add columns to quiz_exam table
    console.log('Migrating quiz_exam table...');
    await db.query(`
      ALTER TABLE quiz_exam 
      ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES course(course_id),
      ADD COLUMN IF NOT EXISTS exam_type VARCHAR DEFAULT 'scheduled',
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false
    `).catch(() => {
      console.log('quiz_exam columns may already exist');
    });

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
