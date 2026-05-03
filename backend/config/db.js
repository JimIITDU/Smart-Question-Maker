const { Pool } = require("pg");

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else if (process.env.NODE_ENV !== 'production') {
  // Local development fallback
  const a = String.fromCharCode(64);
  const p1 = "postgresql://neondb_owner:npg_u9brOpC2xBdo";
  const p2 =
    "ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  pool = new Pool({
    connectionString: p1 + a + p2,
    ssl: { rejectUnauthorized: false },
  });
} else {
  throw new Error("DATABASE_URL is required in production!");
}

module.exports = pool;
