// db.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const testDB = async () => {
  console.log("🧪 Testing database connection...");
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ DB connected. Time:", res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    throw err;
  }
};

export default pool;
