// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch"; // <-- REQUIRED!
import { testDB } from "./db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  console.log("📡 / route hit");

  try {
    const dbResult = await testDB();
    const aiResult = await testDeepSeek();

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

// 🔮 DeepSeek test function
async function testDeepSeek() {
  console.log("🧠 Calling DeepSeek...");

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

  const data = await response.json();
  console.log("🤖 DeepSeek responded:", data.choices?.[0]?.message?.content);
  return data.choices?.[0]?.message?.content || "No reply";
}

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
