// db.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const testDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    return res.rows[0];
  } catch (err) {
    console.error("DB error:", err);
    return null;
  }
};

export default pool;

