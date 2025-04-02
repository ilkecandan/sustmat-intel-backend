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

    console.log("🕰️ Waiting for page content...");
    await page.waitForSelector("h2.entry-title a", { timeout: 0 }); // ⬅️ Timeout removed

    console.log("🔍 Directory loaded.");

    const startups = await page.$$eval(".fusion-post-content", (entries) => {
      return entries.map((el) => {
        const name = el.querySelector("h2.entry-title a")?.innerText.trim();
        const url = el.querySelector("h2.entry-title a")?.href;
        const category = el.innerHTML.includes("Category:")
          ? el.innerHTML.split("Category:")[1].split("<")[0].trim()
          : null;
        const location = el.innerHTML.includes("Based in:")
          ? el.innerHTML.split("Based in:")[1].split("<")[0].trim()
          : null;
        const tags = el.innerHTML.includes("Tags:")
          ? el.innerHTML
              .split("Tags:")[1]
              .split("<")[0]
              .split(",")
              .map((t) => t.trim())
          : ["unknown"];

        const summary = Array.from(el.querySelectorAll("p"))
          .map((p) => p.innerText)
          .join(" ")
          .trim();

        return {
          title: name,
          summary,
          source_url: url,
          type: "startup",
          tags,
          organization: name,
          location: location || category || null,
        };
      });
    });

    console.log(`🧾 Extracted ${startups.length} startups.`);

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
            startup.location,
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
