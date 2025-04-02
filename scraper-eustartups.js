// scraper-eustartups.js
import { chromium } from "playwright";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

export const scrapeDirectory = async () => {
  console.log("🧙‍♀️ Launching Playwright…");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.eu-startups.com/directory/", { waitUntil: "networkidle" });
    await page.waitForSelector(".directory-entry");

    console.log("🔍 Directory loaded.");

    const startups = await page.$$eval(".directory-entry", entries => {
      return entries.map(el => {
        const name = el.querySelector("h2.entry-title a")?.innerText.trim();
        const url = el.querySelector("h2.entry-title a")?.href;
        const summary = el.querySelector(".directory-excerpt")?.innerText.trim();
        const meta = el.querySelector(".directory-meta")?.innerText.trim();

        return {
          title: name,
          summary,
          source_url: url,
          type: "startup",
          tags: ["unknown"],
          organization: name,
          location: meta || null
        };
      });
    });

    console.log(`🧾 Extracted ${startups.length} startups.`);

    let insertedCount = 0;

    for (const startup of startups) {
      try {
        await pool.query(
          `INSERT INTO developments (title, summary, source_url, type, tags, organization, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (source_url) DO NOTHING`,
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

    console.log(`✅ Done. Inserted ${insertedCount} new entries.`);
    return { inserted: insertedCount, total: startups.length, success: true };

  } catch (err) {
    console.error("❌ Scraper error:", err.message);
    return { success: false, error: err.message };
  } finally {
    await browser.close();
  }
};

// Run manually
if (process.argv[1] === new URL(import.meta.url).pathname) {
  scrapeDirectory();
}
