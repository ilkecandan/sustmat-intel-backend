// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { testDB } from "./db.js";

dotenv.config();

const app = express();

// 🛠️ Force correct port binding for Railway
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("🚨 Railway PORT is not defined in environment");
}

app.get("/", async (req, res) => {
  console.log("📡 / route hit");

  try {
    const dbResult = await testDB();
    const aiResult = await callDeepSeek(); // renamed to avoid confusion

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

// 💬 DeepSeek integration
async function callDeepSeek() {
  console.log("🧠 Calling DeepSeek...");

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
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
