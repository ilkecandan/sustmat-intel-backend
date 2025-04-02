// db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Check if the environment variable is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in environment variables.");
  process.exit(1); // Stop execution
}

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required by Railway
  }
});

// Function to test DB connection
export const testDB = async () => {
  console.log("🧪 Testing database connection...");
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected. Current time:", res.rows[0].now);
    return res.rows[0];
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    throw err;
  }
};

export default pool;
