#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

const repoRoot = process.cwd();
const newsDir = join(repoRoot, "news");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function detectTruncatedMarker(filename) {
  const markers = [
    { pattern: /\-\.\.\./, name: "truncated at -..." },
    { pattern: /\.\.\./, name: "truncated at ..." },
    { pattern: /\-$/, name: "truncated at end with -" },
  ];

  for (const { pattern, name } of markers) {
    if (pattern.test(filename)) {
      return name;
    }
  }
  return null;
}

function extractTitleFromHtml(html) {
  const match = html.match(/<title>(.*?)<\/title>/);
  return match ? match[1] : null;
}

console.log("=== TRUNCATED URLs DETECTION ===\n");

const files = readdirSync(newsDir)
  .filter(f => f.endsWith('.html') && f.toLowerCase() !== 'index.html' && f.toLowerCase() !== 'article-template.html')
  .filter(f => detectTruncatedMarker(f))
  .sort();

console.log(`Found ${files.length} truncated URL(s):\n`);

let i = 0;
for (const filename of files) {
  const fullPath = path.join(newsDir, filename);
  const html = readFileSync(fullPath, 'utf8');
  const title = extractTitleFromHtml(html);

  const oldSlug = filename.split('-').slice(0, -1).join('-').replace(/2026-11-09-/, '');
  const newSlug = slugify(title);

  console.log(`${i + 1}. ${filename}`);
  console.log(`   Title: ${title?.substring(0, 70)}${title?.length > 70 ? '...' : ''}`);
  console.log(`   Old slug: ${oldSlug.substring(0, 60)}${oldSlug.length > 60 ? '...' : ''}`);
  console.log(`   New slug: ${newSlug}`);
  console.log(`   New filename: 2026-11-09-${newSlug}-${filename.split('-').slice(-1)[0]}`);
  console.log('');
  i++;
}

console.log(`Total: ${files.length} articles need migration`);
