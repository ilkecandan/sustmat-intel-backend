// scraper-eustartups.js
import fetch from "node-fetch";
import cheerio from "cheerio";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const BASE_URL = "https://www.eu-startups.com/directory/";

const scrapeDirectory = async () => {
  console.log("🕵️ Starting EU-Startups scrape...");

  try {
    const res = await fetch(BASE_URL);
    const html = await res.text();
    const $ = cheerio.load(html);

    const startups = [];

    $(".directory-entry").each((i, el) => {
      const name = $(el).find("h2.entry-title a").text().trim();
      const url = $(el).find("h2.entry-title a").attr("href");
      const description = $(el).find(".directory-excerpt").text().trim();
      const extra = $(el).find(".directory-meta").text().trim();

      // Later we’ll parse country/category from 'extra' if needed

      startups.push({
        name,
        summary: description,
        source_url: url,
        type: "startup",
        tags: ["unknown"],
        organization: name
      });
    });

    console.log(`🔍 Found ${startups.length} startups`);

    for (const s of startups) {
      await pool.query(
        `INSERT INTO developments (title, summary, source_url, type, tags, organization)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [s.name, s.summary, s.source_url, s.type, s.tags, s.organization]
      );
    }

    console.log("✅ Scraping & saving completed.");
  } catch (err) {
    console.error("❌ Scraper error:", err);
  }
};

scrapeDirectory();

