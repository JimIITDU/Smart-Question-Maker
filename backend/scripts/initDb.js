const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  try {
    console.log("Connecting to database...");
    const schemaPath = path.join(__dirname, "../../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    console.log("Running schema...");
    await pool.query(schema);
    console.log("✅ Database tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

initDb();
