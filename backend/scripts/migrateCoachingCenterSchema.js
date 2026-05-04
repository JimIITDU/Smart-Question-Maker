const db = require('../config/db.js');

async function migrate() {
  try {
    console.log('Adding coaching_admin_id to coaching_center...');
    
    // Add coaching_admin_id if not exists
    await db.query(`
      ALTER TABLE coaching_center 
      ADD COLUMN IF NOT EXISTS coaching_admin_id INTEGER
    `);
    
    // Make it FK
    await db.query(`
      ALTER TABLE coaching_center
      ADD CONSTRAINT fk_center_coaching_admin 
      FOREIGN KEY (coaching_admin_id) REFERENCES users(user_id)
    `);
    
    // Add photo fields if missing
    const fields = ['owner_photo', 'nid_front', 'nid_back'];
    for (const field of fields) {
      await db.query(`
        ALTER TABLE coaching_center 
        ADD COLUMN IF NOT EXISTS ${field} VARCHAR(255)
      `);
    }
    
    // Add status if missing
    await db.query(`
      ALTER TABLE coaching_center 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
    `);
    
    // Add submitted_at
    await db.query(`
      ALTER TABLE coaching_center 
      ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT NOW()
    `);
    
    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();

