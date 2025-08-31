#!/usr/bin/env node

/**
 * PasswordMonkey News Manifest Updater with readTime
 * 
 * Scans /news folder and updates news-manifest.json
 */

const fs = require('fs');
const path = require('path');

// Directory containing news HTML files
const newsDir = path.join(__dirname, '../news');
const manifestPath = path.join(newsDir, 'news-manifest.json');

// Utility: Estimate reading time from HTML content
function estimateReadTime(htmlContent) {
  const text = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").length;
  const minutes = Math.ceil(words / 200); // 200 words per minute
  return `${minutes} min read`;
}

// Utility: Extract title from HTML
function extractTitle(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) return titleMatch[1].replace(/\s*\|\s*PasswordMonkey.*$/i, '').trim();
  return null;
}

// Utility: Extract meta description
function extractMetaDescription(html) {
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return descMatch ? descMatch[1] : '';
}

// Read all HTML files in news directory
const files = fs.readdirSync(newsDir)
  .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'article-template.html');

const articles = [];

files.forEach(file => {
  try {
    const html = fs.readFileSync(path.join(newsDir, file), 'utf8');

    // Filename pattern: YYYY-MM-DD-title-id.html
    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)-[a-z0-9]+\.html$/i);
    if (!match) {
      console.warn(`⚠️ Filename does not match pattern: ${file}`);
      return;
    }

    const datePart = match[1];
    const slug = match[2];

    const title = extractTitle(html) || slug.replace(/-/g, ' ');
    const description = extractMetaDescription(html);
    const readTime = estimateReadTime(html);

    const stats = fs.statSync(path.join(newsDir, file));
    const statsDate = stats.mtime.toISOString();

    articles.push({
      id: slug,
      file,
      slug,
      title,
      description,
      published: datePart,
      updated: statsDate,
      readTime
    });

  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
});

// Sort by published date descending
articles.sort((a, b) => new Date(b.published) - new Date(a.published));

// Write manifest
const manifest = {
  lastUpdated: new Date().toISOString(),
  totalArticles: articles.length,
  articles
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`💾 Manifest updated: ${manifestPath}`);
console.log(`📚 Total articles in manifest: ${articles.length}`);
