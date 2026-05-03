const pool = require("../config/db");

async function columnExists(client, table, column) {
  const result = await client.query(
    `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = $2
  `,
    [table, column],
  );
  return result.rows.length > 0;
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("🔧 Checking question_bank table for new columns...");

    // Add status column
    if (!(await columnExists(client, "question_bank", "status"))) {
      await client.query(
        `ALTER TABLE question_bank ADD COLUMN status VARCHAR(20) DEFAULT 'active'`,
      );
      console.log("✅ Added status column");
    } else {
      console.log("ℹ️ status column already exists");
    }

    // Add negative_marks column
    if (!(await columnExists(client, "question_bank", "negative_marks"))) {
      await client.query(
        `ALTER TABLE question_bank ADD COLUMN negative_marks DECIMAL(5,2) DEFAULT 0`,
      );
      console.log("✅ Added negative_marks column");
    } else {
      console.log("ℹ️ negative_marks column already exists");
    }

    // Add explanation column
    if (!(await columnExists(client, "question_bank", "explanation"))) {
      await client.query(
        `ALTER TABLE question_bank ADD COLUMN explanation TEXT`,
      );
      console.log("✅ Added explanation column");
    } else {
      console.log("ℹ️ explanation column already exists");
    }

    // Add chapter_id column
    if (!(await columnExists(client, "question_bank", "chapter_id"))) {
      await client.query(
        `ALTER TABLE question_bank ADD COLUMN chapter_id INTEGER`,
      );
      console.log("✅ Added chapter_id column");
    } else {
      console.log("ℹ️ chapter_id column already exists");
    }

    // Add options JSONB column
    if (!(await columnExists(client, "question_bank", "options"))) {
      await client.query(`ALTER TABLE question_bank ADD COLUMN options JSONB`);
      console.log("✅ Added options JSONB column");
    } else {
      console.log("ℹ️ options column already exists");
    }

    // Add correct_answers JSONB column
    if (!(await columnExists(client, "question_bank", "correct_answers"))) {
      await client.query(
        `ALTER TABLE question_bank ADD COLUMN correct_answers JSONB`,
      );
      console.log("✅ Added correct_answers JSONB column");
    } else {
      console.log("ℹ️ correct_answers column already exists");
    }

    // Add ai_generated to source_enum
    try {
      await client.query(`ALTER TYPE source_enum ADD VALUE 'ai_generated'`);
      console.log("✅ Added ai_generated to source_enum");
    } catch (err) {
      if (err.message.includes("already exists") || err.code === "42710") {
        console.log("ℹ️ ai_generated already exists in source_enum");
      } else {
        throw err;
      }
    }

    await client.query("COMMIT");
    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
