const db = require('../config/db');

async function migrate() {
  console.log('🚀 Migrating course table fields...');

  try {
    // 1. Add category ENUM
    await db.query(`
      DO \$\$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_category') THEN
          CREATE TYPE course_category AS ENUM ('school', 'university', 'competitive');
        END IF;
      END\$\$;
    `);

    // 2. Add class_level (varchar - free text like "Class 9-10")
    await db.query(`ALTER TABLE course ADD COLUMN IF NOT EXISTS class_level VARCHAR(100);`);

    // 3. Add subjects_covered JSONB
    await db.query(`ALTER TABLE course ADD COLUMN IF NOT EXISTS subjects_covered JSONB DEFAULT '[]'::jsonb;`);

    // 4. Add max_students
    await db.query(`ALTER TABLE course ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT NULL;`);

    // 5. Add thumbnail
    await db.query(`ALTER TABLE course ADD COLUMN IF NOT EXISTS thumbnail VARCHAR(500) DEFAULT NULL;`);

    // 6. Add lifecycle_status ENUM (extend existing status)
    await db.query(`
      DO \$\$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_lifecycle') THEN
          CREATE TYPE course_lifecycle AS ENUM ('draft', 'published', 'active', 'completed', 'archived');
        END IF;
        ALTER TABLE course ADD COLUMN IF NOT EXISTS lifecycle_status course_lifecycle DEFAULT 'draft';
        -- Migrate existing status to lifecycle
        UPDATE course SET lifecycle_status = 'active' WHERE status = 'active';
        UPDATE course SET lifecycle_status = 'draft' WHERE status = 'draft';
        -- Default others to 'active'
        UPDATE course SET lifecycle_status = 'active' WHERE lifecycle_status IS NULL;
      END\$\$;
    `);

    // 7. Add indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_course_lifecycle ON course(lifecycle_status);`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_course_category ON course(category);`);

    console.log('✅ Migration complete! Added: category, class_level, subjects_covered, max_students, thumbnail, lifecycle_status');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate()
  .then(() => {
    console.log('🎉 Migration successful!');
    process.exit(0);
  })
  .catch(console.error);

