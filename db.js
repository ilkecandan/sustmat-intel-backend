// db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in environment variables.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const testDB = async () => {
  console.log("🧪 Testing database connection...");
  try {
    const result = await pool.query("SELECT NOW()");
    const time = result.rows[0]?.now || "Unknown time";
    console.log("✅ DB connected. Current time:", time);
    return { now: time };
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error.message);
    throw error;
  }
};

export default pool;
