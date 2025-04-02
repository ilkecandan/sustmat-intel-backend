// db.js
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from .env or Railway
dotenv.config();

const { Pool } = pg;

// Initialize connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required by Railway's free Postgres SSL
  }
});

// Simple test query to check DB connection
export const testDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    return res.rows[0]; // { now: '2025-04-02T...' }
  } catch (err) {
    console.error("🔴 DB error:", err);
    return null;
  }
};

export default pool;
