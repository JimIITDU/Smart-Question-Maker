const { Pool } = require("pg");

const a = String.fromCharCode(64);
const p1 = "postgresql://neondb_owner:npg_u9brOpC2xBdo";
const p2 =
  "ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: p1 + a + p2,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    console.log("🔧 Checking question_bank table...");

    // Check if coaching_center_id column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'question_bank' AND column_name = 'coaching_center_id'
    `);

    if (checkResult.rows.length > 0) {
      console.log("✅ coaching_center_id column already exists!");
      process.exit(0);
    }

    console.log("➕ Adding coaching_center_id column...");

    // Add the column
    await pool.query(`
      ALTER TABLE question_bank 
      ADD COLUMN coaching_center_id INTEGER REFERENCES coaching_center(coaching_center_id)
    `);

    console.log("✅ coaching_center_id column added successfully!");

    // Show current questions without center
    const questionsResult = await pool.query(`
      SELECT question_id, question_text FROM question_bank WHERE coaching_center_id IS NULL
    `);

    if (questionsResult.rows.length > 0) {
      console.log(
        `⚠️  ${questionsResult.rows.length} questions have no coaching_center_id.`,
      );
      console.log("   Run seed.js to populate data or update them manually.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
