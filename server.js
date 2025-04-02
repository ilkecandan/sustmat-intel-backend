// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { testDB } from "./db.js";
import { scrapeDirectory } from "./scraper-eustartups.js"; // ⬅️ Scraper import
import pool from "./db.js"; // ⬅️ Added for /dev/all

dotenv.config();

const app = express();

// 🛠️ Force correct port binding for Railway
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("🚨 Railway PORT is not defined in environment");
}

// 🌐 Home route: check backend, DB, and DeepSeek status
app.get("/", async (req, res) => {
  console.log("📡 / route hit");

  try {
    const dbResult = await testDB();
    const aiResult = await callDeepSeek();

    res.json({
      status: "🟢 Online",
      db: dbResult,
      ai: aiResult,
      message: "Backend is connected to both DB and DeepSeek!"
    });
  } catch (error) {
    console.error("❌ Route error:", error);
    res.status(500).json({
      status: "🔴 Error",
      message: "Something went wrong with DB or DeepSeek",
      error: error.message
    });
  }
});

// 🧲 Manual trigger for the scraper
app.get("/run-scraper", async (req, res) => {
  console.log("🧲 /run-scraper route hit");

  try {
    const result = await scrapeDirectory();
    res.json({
      status: result.success ? "🟢 Scraper Success" : "🔴 Scraper Failed",
      ...result
    });
  } catch (err) {
    console.error("❌ Scraper route error:", err.message);
    res.status(500).json({
      status: "🔴 Scraper Route Failed",
      error: err.message
    });
  }
});

// 🔍 Debug: Show latest entries in DB (for development)
app.get("/dev/all", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM developments ORDER BY id DESC LIMIT 10");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💬 DeepSeek test call
async function callDeepSeek() {
  console.log("🧠 Calling DeepSeek...");

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello! Just say 'Hello back.'" }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DeepSeek error: ${response.status} ${response.statusText} — ${text}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No reply";
    console.log("🤖 DeepSeek replied:", reply);
    return reply;
  } catch (err) {
    console.error("❌ DeepSeek failed:", err.message);
    return "DeepSeek error: " + err.message;
  }
}

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
