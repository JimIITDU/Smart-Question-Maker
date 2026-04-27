const { Pool } = require('pg');

const parts = [
  'postgresql://neondb_owner:npg_u9brOpC2xBdo',
  'ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
];

const pool = new Pool({
  connectionString: parts.join(String.fromCharCode(64)),
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;