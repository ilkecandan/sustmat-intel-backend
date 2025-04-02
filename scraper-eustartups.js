// scraper-eustartups.js
import fetch from "node-fetch";
import cheerio from "cheerio";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const BASE_URL = "https://www.eu-startups.com/directory/";

export const scrapeDirectory = async () => {
  console.log("🕵️ Starting EU-Startups scrape...");

  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const startups = [];

    $(".directory-entry").each((i, el) => {
      const name = $(el).find("h2.entry-title a").text().trim();
      const url = $(el).find("h2.entry-title a").attr("href");
      const summary = $(el).find(".directory-excerpt").text().trim();
      const meta = $(el).find(".directory-meta").text().trim();

      startups.push({
        title: name,
        summary,
        source_url: url,
        type: "startup",
        tags: ["unknown"], // Placeholder — refine later with AI classification
        organization: name,
        location: meta || null
      });
    });

    console.log(`🔍 Found ${startups.length} startups`);

    let insertedCount = 0;

    for (const startup of startups) {
      try {
        await pool.query(
          `
          INSERT INTO developments (title, summary, source_url, type, tags, organization, location)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (source_url) DO NOTHING
          `,
          [
            startup.title,
            startup.summary,
            startup.source_url,
            startup.type,
            startup.tags,
            startup.organization,
            startup.location
          ]
        );
        insertedCount++;
      } catch (err) {
        console.error("⚠️ Insert failed for:", startup.title, "-", err.message);
      }
    }

    console.log(`✅ Scraping & saving completed. Inserted ${insertedCount} records.`);
    return { success: true, inserted: insertedCount, total: startups.length };
  } catch (err) {
    console.error("❌ Scraper error:", err.message);
    return { success: false, error: err.message };
  }
};

// If executed directly, run the scraper
if (process.argv[1] === new URL(import.meta.url).pathname) {
  scrapeDirectory();
}
