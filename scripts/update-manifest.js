// scripts/update-manifest.js

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

console.log("🚀 Starting PasswordMonkey News Manifest Update...");

// Correct path: go one level up from /scripts to /news
const newsDir = path.join(__dirname, "..", "news");
const manifestPath = path.join(newsDir, "news-manifest.json");

// Make sure news directory exists
if (!fs.existsSync(newsDir)) {
  console.error("❌ News directory not found:", newsDir);
  process.exit(1);
}

console.log("📁 Scanning directory:", newsDir);

// Load existing manifest or create a new one
let manifest = {
  articles: [],
  lastUpdated: new Date().toISOString(),
};

if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (err) {
    console.warn("⚠️ Could not parse existing manifest, starting fresh.");
  }
} else {
  console.log("📋 Created new manifest structure");
}

const files = fs.readdirSync(newsDir).filter(f => f.endsWith(".html"));

let processed = 0;
let newArticles = 0;
let updatedArticles = 0;
let errors = 0;

files.forEach(file => {
  try {
    const filePath = path.join(newsDir, file);
    const html = fs.readFileSync(filePath, "utf8");
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const title = doc.querySelector("title")?.textContent?.trim() || file;
    const description = doc.querySelector("meta[name='description']")?.getAttribute("content") || "";
    const date = fs.statSync(filePath).mtime.toISOString();

    // Check if already exists
    const existing = manifest.articles.find(a => a.file === file);

    if (existing) {
      existing.title = title;
      existing.description = description;
      existing.date = date;
      updatedArticles++;
    } else {
      manifest.articles.push({ file, title, description, date });
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
