// db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in environment variables.");
  process.exit(1);
}

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Railway DB SSL
  }
});

// Test the connection with a timestamp query
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
