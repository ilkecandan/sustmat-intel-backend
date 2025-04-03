import { chromium } from 'playwright';
import dotenv from 'dotenv';
import pool from './db.js'; // DB connection
import Parser from 'rss-parser'; // RSS feed parser

dotenv.config();
const parser = new Parser();

// Function to fetch ScienceDaily RSS feed
const fetchScienceDaily = async () => {
  const feed = await parser.parseURL('https://www.sciencedaily.com/rss/matter_energy/materials_science.xml');
  feed.items.forEach(async (item) => {
    const { title, link, pubDate, contentSnippet } = item;
    
    const insertText = 'INSERT INTO developments(source, title, summary, source_url, pub_date) VALUES($1, $2, $3, $4, $5) ON CONFLICT (source_url) DO NOTHING';
    await pool.query(insertText, ['ScienceDaily', title, contentSnippet, link, new Date(pubDate)]);
  });
};

export { fetchScienceDaily };

// Scraping trigger (if called directly)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  fetchScienceDaily();
}
