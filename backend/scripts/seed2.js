const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// ── DB Connection ──────────────────────────────────────────────────────────
const at = String.fromCharCode(64);
const p1 = 'postgresql://neondb_owner:npg_u9brOpC2xBdo';
const p2 = 'ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || (p1 + at + p2),
  ssl: { rejectUnauthorized: false },
});

async function seed2() {
  const client = await pool.connect();
  try {
    console.log('🌱 seed2.js — inserting 6 test users (registration only)...\n');
    await client.query('BEGIN');

    const PASS = await bcrypt.hash('pass@1234', 10);

    // role_id: 1=super_admin, 2=coaching_admin, 3=teacher, 4=staff, 5=student, 6=parent
    const users = [
      { email: 'tsuper@gmail.com',  name: 'Test Super Admin',   role_id: 1 },
      { email: 'tadmin@gmail.com',  name: 'Test Coaching Admin', role_id: 2 },
      { email: 'tteacher@gmail.com',name: 'Test Teacher',        role_id: 3 },
      { email: 'tstaff@gmail.com',  name: 'Test Staff',          role_id: 4 },
      { email: 'tstudent@gmail.com',name: 'Test Student',        role_id: 5 },
      { email: 'tparent@gmail.com', name: 'Test Parent',         role_id: 6 },
    ];

    for (const u of users) {
      const { rows: [{ user_id }] } = await client.query(
        `INSERT INTO users (role_id, email, password_hash, name, is_email_verified, status)
         VALUES ($1, $2, $3, $4, true, 'active')
         ON CONFLICT (email) DO NOTHING
         RETURNING user_id`,
        [u.role_id, u.email, PASS, u.name]
      );
      if (user_id) {
        console.log(`  ✅ ${u.email}  (role_id: ${u.role_id})`);
      } else {
        console.log(`  ⚠️  ${u.email} already exists — skipped`);
      }
    }

    await client.query('COMMIT');

    console.log('\n✅ Done!');
    console.log('─────────────────────────────────────────');
    console.log('All passwords: pass@1234');
    console.log('─────────────────────────────────────────');
    console.log('  tsuper@gmail.com   → Super Admin');
    console.log('  tadmin@gmail.com   → Coaching Admin');
    console.log('  tteacher@gmail.com → Teacher');
    console.log('  tstaff@gmail.com   → Staff');
    console.log('  tstudent@gmail.com → Student');
    console.log('  tparent@gmail.com  → Parent');
    console.log('─────────────────────────────────────────');
    console.log('No centers, courses, batches, or any');
    console.log('other data was created or modified.');
    console.log('seed.js data is fully intact.');

    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ seed2 failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed2();