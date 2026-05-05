const db = require('../config/db.js');

async function fullFix() {
  try {
    console.log('🔧 Full coaching_center schema fix...');

    const columns = [
      'coaching_admin_id INTEGER',
      "center_type VARCHAR(50)",
      'established_year VARCHAR(10)',
      'address_division VARCHAR(100)',
      'address_district VARCHAR(100)',
      'address_upazila VARCHAR(100)',
      'website VARCHAR(255)',
      'description TEXT',
      'owner_name VARCHAR(255)',
      'owner_nid VARCHAR(50)',
      'owner_phone VARCHAR(20)',
      'submitted_at TIMESTAMP'
    ];

    for (const col of columns) {
      const colName = col.split(' ')[0];
      await db.query(`
        ALTER TABLE coaching_center 
        ADD COLUMN IF NOT EXISTS ${colName} ${col.split(' ')[1]}
      `);
    }

    // Update FK for coaching_admin_id
    await db.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT conname FROM pg_constraint WHERE conname = 'fk_center_coaching_admin'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'coaching_center' AND column_name = 'coaching_admin_id'
        ) THEN
          ALTER TABLE coaching_center ADD CONSTRAINT fk_center_coaching_admin 
          FOREIGN KEY (coaching_admin_id) REFERENCES users(user_id);
        END IF;
      END $$;
    `);

    console.log('✅ Full schema fixed!');
    console.log('Restart backend and test!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

fullFix();

