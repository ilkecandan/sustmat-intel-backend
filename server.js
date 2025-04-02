// server.js
import express from "express";
import dotenv from "dotenv";
import { testDB } from "./db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
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
    res.status(500).json({
      status: "🔴 Error",
      message: "Something went wrong with DB or DeepSeek",
      error: error.message
    });
  }
});

// New helper function
async function testDeepSeek() {
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
  const reply = data.choices?.[0]?.message?.content || "No reply";
  return reply;
}

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
