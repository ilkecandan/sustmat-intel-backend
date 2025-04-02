// server.js
import express from "express";
import dotenv from "dotenv";
import { testDB } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const result = await testDB();
  res.json({ status: "Online", db: result });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

