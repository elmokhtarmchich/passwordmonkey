// scripts/update-manifest.js

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

console.log("🚀 Starting PasswordMonkey News Manifest Update...");

// Correct path to /news
const newsDir = path.join(__dirname, "..", "news");
const manifestPath = path.join(newsDir, "news-manifest.json");

// Ensure directory exists
if (!fs.existsSync(newsDir)) {
  console.error("❌ News directory not found:", newsDir);
  process.exit(1);
}

console.log("📁 Scanning directory:", newsDir);

// Load or init manifest safely
let manifest = { articles: [], lastUpdated: new Date().toISOString() };
if (fs.existsSync(manifestPath)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest = {
      articles: parsed.articles || [],
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.warn("⚠️ Could not parse existing manifest, starting fresh.");
  }
}

// Get only *.html files, skip index.html and template
const files = fs.readdirSync(newsDir)
  .filter(f => f.endsWith(".html") && f !== "index.html" && f !== "article-template.html");

let processed = 0, newArticles = 0, updatedArticles = 0, errors = 0;

files.forEach(file => {
  try {
    const filePath = path.join(newsDir, file);
    const html = fs.readFileSync(filePath, "utf8");
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract title/description
    const title = doc.querySelector("title")?.textContent?.trim() || file;
    const description = doc.querySelector("meta[name='description']")?.getAttribute("content") || "";

    // Extract metadata from filename
    // e.g. "2025-08-29-click-studios-patches-passwordstate-authentication-e4b067.html"
    const base = path.basename(file, ".html");
    const parts = base.split("-");
    const datePart = parts.slice(0, 3).join("-"); // YYYY-MM-DD
    const id = parts[parts.length - 1];           // last piece = unique ID
    const slug = parts.slice(3, -1).join("-");    // everything between date and ID

    const statsDate = fs.statSync(filePath).mtime.toISOString();

    const newArticle = {
      id,
      file,
      slug,
      title,
      description,
      published: datePart,
      updated: statsDate,
    };

    // Check existing by id
    const existing = manifest.articles.find(a => a.id === id);

    if (existing) {
      Object.assign(existing, newArticle);
      updatedArticles++;
    } else {
      manifest.articles.push(newArticle);
      newArticles++;
    }

    processed++;
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
    errors++;
  }
});

// Update manifest metadata
manifest.lastUpdated = new Date().toISOString();

// Save manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log("💾 Manifest updated:", manifestPath);

// Report
console.log(`
📊 Update Report:
================
📁 Total files scanned: ${files.length}
✅ Successfully processed: ${processed}
➕ New articles added: ${newArticles}
🔄 Articles updated: ${updatedArticles}
❌ Errors encountered: ${errors}
📚 Total articles in manifest: ${manifest.articles.length}
📅 Last updated: ${manifest.lastUpdated}
✅ News manifest update completed successfully!
`);
