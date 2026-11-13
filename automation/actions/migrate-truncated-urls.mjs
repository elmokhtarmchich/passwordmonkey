#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "fs/promises";

const repoRoot = process.cwd();
const newsDir = path.join(repoRoot, "news");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    // No truncation - full slug length
    .trim();
}

function detectTruncatedMarker(filename) {
  const markers = [
    { pattern: /\-\.\.\./, name: "truncated at -..." },
    { pattern: /\.\.\./, name: "truncated at ..." },
    { pattern: /\-$/, name: "truncated at end with -" },
    { pattern: /\/$/, name: "truncated at end with /" },
    { pattern: /\?$/, name: "truncated at end with ?" },
  ];

  for (const { pattern, name } of markers) {
    if (pattern.test(filename)) {
      return name;
    }
  }
  return null;
}

async function extractTitleFromHtml(html) {
  const match = html.match(/<title>(.*?)<\/title>/);
  return match ? match[1] : null;
}

async function migrateTruncatedUrls() {
  console.log("=== Migrating Truncated URLs ===\n");

  const files = await fs.readdir(newsDir);
  const truncatedFiles = files
    .filter(f => f.endsWith('.html') && f.toLowerCase() !== 'index.html' && f.toLowerCase() !== 'article-template.html')
    .filter(f => detectTruncatedMarker(f))
    .sort();

  console.log(`Found ${truncatedFiles.length} truncated URL(s)\n`);

  if (truncatedFiles.length === 0) {
    console.log("✓ No truncated URLs found!");
    return;
  }

  let fixedCount = 0;
  let skippedCount = 0;

  for (const filename of truncatedFiles) {
    console.log(`\nProcessing: ${filename}`);

    const fullPath = path.join(newsDir, filename);
    const html = await readFile(fullPath, 'utf8');
    const title = extractTitleFromHtml(html);

    if (!title) {
      console.log(`  ⚠️  Could not extract title, skipping`);
      skippedCount++;
      continue;
    }

    console.log(`  Title: ${title}`);
    console.log(`  Truncation marker detected`);

    const newSlug = slugify(title);
    const newFilename = `2026-11-09-${newSlug}-${filename.split('-').slice(-1)[0]}`;

    console.log(`  New slug: ${newSlug}`);
    console.log(`  New filename: ${newFilename}`);

    // Read existing HTML
    let newHtml = html;

    // Update all occurrences of the old URL in the HTML
    const oldUrl = `href="/news/${filename}"`;
    const newUrl = `href="/news/${newFilename}"`;
    newHtml = newHtml.split(oldUrl).join(newUrl);

    // Update the canonical URL in the head
    newHtml = newHtml.replace(
      /<link rel="canonical" href="\/news\/[^"]+">/,
      `<link rel="canonical" href="/news/${newFilename}">`
    );

    // Update Open Graph URLs
    newHtml = newHtml.replace(
      /og:url" content="https:\/\/passwordmonkey\.org\/news\/[^"]+"/g,
      `og:url" content="https://passwordmonkey.org/news/${newFilename}"`
    );

    // Update Twitter URLs
    newHtml = newHtml.replace(
      /twitter:url" content="https:\/\/passwordmonkey\.org\/news\/[^"]+"/g,
      `twitter:url" content="https://passwordmonkey.org/news/${newFilename}"`
    );

    // Update internal links in the article
    newHtml = newHtml.replace(/href="\/news\/[^"]+\.html"/g, `href="/news/${newFilename}"`);

    // Write new HTML
    await writeFile(path.join(newsDir, newFilename), newHtml, 'utf8');

    // Delete old file
    await fs.unlink(fullPath);

    console.log(`  ✓ Fixed and migrated to: ${newFilename}`);
    fixedCount++;
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`✓ Fixed: ${fixedCount}`);
  console.log(`⚠️  Skipped: ${skippedCount}`);
}

// Import path module
import { join as pathJoin } from "path";
const path = { join: pathJoin, dirname: (str) => str.split('/').slice(0, -1).join('/'), resolve: (str) => str };

// Mock fs object
const fs = {
  readFile,
  writeFile,
  readdir: (dir) => {
    return new Promise((resolve, reject) => {
      try {
        const files = require('fs').readdirSync(dir);
        resolve(files);
      } catch (err) {
        reject(err);
      }
    });
  },
  unlink: (path) => {
    return new Promise((resolve, reject) => {
      try {
        require('fs').unlinkSync(path);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
};

migrateTruncatedUrls().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
