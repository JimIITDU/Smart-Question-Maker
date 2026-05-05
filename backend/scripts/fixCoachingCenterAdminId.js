const db = require('../config/db.js');

async function fixMigration() {
  try {
    console.log('🔧 Fixing coaching_center.coaching_admin_id column...');

    // Force add if missing
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'coaching_center' AND column_name = 'coaching_admin_id'
        ) THEN
          ALTER TABLE coaching_center ADD COLUMN coaching_admin_id INTEGER;
        END IF;
      END $$;
    `);

    // Add FK if missing
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'fk_center_coaching_admin'
        ) THEN
          ALTER TABLE coaching_center
          ADD CONSTRAINT fk_center_coaching_admin 
          FOREIGN KEY (coaching_admin_id) REFERENCES users(user_id);
        END IF;
      END $$;
    `);

    // Add status if missing
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'coaching_center' AND column_name = 'status'
        ) THEN
          ALTER TABLE coaching_center ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        END IF;
      END $$;
    `);

    // Add submitted_at
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'coaching_center' AND column_name = 'submitted_at'
        ) THEN
          ALTER TABLE coaching_center ADD COLUMN submitted_at TIMESTAMP DEFAULT NOW();
        END IF;
      END $$;
    `);

    console.log('✅ All columns added!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixMigration();
