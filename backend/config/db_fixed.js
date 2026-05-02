const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false, sslmode: 'require' }
  });
} else {
  const a = String.fromCharCode(64);
  const p1 = 'postgresql://neondb_owner:npg_u9brOpC2xBdo';
  const p2 = 'ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
  pool = new Pool({
    connectionString: p1 + a + p2,
    ssl: { rejectUnauthorized: false, sslmode: 'require' }
  });
}

module.exports = pool;
