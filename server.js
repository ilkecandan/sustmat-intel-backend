import express from 'express';
import dotenv from 'dotenv';
import { fetchScienceDaily } from './scraper-eustartups.js'; // Scraper
import pool from './db.js'; // DB connection

dotenv.config();

const app = express();

// Route to get latest articles
app.get('/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM developments ORDER BY pub_date DESC LIMIT 5');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to run the scraper manually
app.get('/run-scraper', async (req, res) => {
  try {
    await fetchScienceDaily();
    res.send('Data collection complete!');
  } catch (error) {
    res.status(500).send('Error in scraping: ' + error.message);
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
