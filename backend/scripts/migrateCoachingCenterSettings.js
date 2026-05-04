const db = require('../config/db.js');

async function migrate() {
  try {
    console.log('Starting coaching_center settings migration...');

    // Add exam_layout column
    const examLayoutRes = await db.query(`
      ALTER TABLE coaching_center 
      ADD COLUMN IF NOT EXISTS exam_layout VARCHAR(20) DEFAULT 'vertical'
    `);
    console.log('✓ exam_layout column added/verified');

    // Add question_mode column
    const questionModeRes = await db.query(`
      ALTER TABLE coaching_center 
      ADD COLUMN IF NOT EXISTS question_mode VARCHAR(20) DEFAULT 'skip_allowed'
    `);
    console.log('✓ question_mode column added/verified');

    // Optional: Add logo_path if not exists (for future)
    await db.query(`
      ALTER TABLE coaching_center 
      ADD COLUMN IF NOT EXISTS logo_path VARCHAR(255)
    `);
    console.log('✓ logo_path column added/verified');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
