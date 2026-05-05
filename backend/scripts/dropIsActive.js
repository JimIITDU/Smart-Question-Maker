const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function dropColumn() {
  const client = await pool.connect();
  try {
    console.log('🗑️ Dropping is_active column from users table...');
    const result = await client.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS "is_active" CASCADE
    `);
    console.log('✅ is_active column dropped successfully');
    
    // Verify
    const check = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_active'
    `);
    if (check.rows.length === 0) {
      console.log('✅ Verified: is_active column no longer exists');
    }
    
    console.log('🎉 Migration complete! Restart server.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

dropColumn();
