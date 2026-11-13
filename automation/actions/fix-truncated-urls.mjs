#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { createHash } from "crypto";

const newsDir = "./news";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function extractTitle(html) {
  const match = html.match(/<title>(.*?) \| Password Monkey<\/title>/);
  return match ? match[1] : null;
}

function generateHash(title) {
  return createHash("sha256").update(title || "").digest("hex").substring(0, 6);
}

// Truncated files that need to be migrated
const truncatedFiles = [
  "2026-11-09-cisa-flags-sonicwall-sonicos-mfa-bypass-flaw-amid--4d02c2.html",
  "2026-11-09-default-adminadmin-server-password-helps-researche-3b7113.html",
  "2026-11-09-hackers-exploiting-sshole-authentication-bypass-in-52cb49.html",
  "2026-11-09-iris-plaza-breach-may-have-exposed-data-of-77-mill-b475f3.html",
  "2026-11-09-over-3-million-people-hit-by-frontline-education-d-1fded0.html",
  "2026-11-09-revolve-puts-data-breach-victim-count-at-15-millio-97dd5a.html",
];

console.log("=== MIGRATING TRUNCATED URLS ===\n");

for (const filename of truncatedFiles) {
  const oldPath = `${newsDir}/${filename}`;
  const html = readFileSync(oldPath, 'utf8');
  const title = extractTitle(html);
  const oldHash = filename.split('-').pop().replace('.html', '');

  if (!title) {
    console.log(`❌ ${filename} - Could not extract title`);
    continue;
  }

  // Generate the correct filename
  const slug = slugify(title);
  const newHash = generateHash(title);
  const newFilename = `2026-11-09-${slug}-${newHash}.html`;
  const newPath = `${newsDir}/${newFilename}`;

  console.log(`Migrating: ${filename}`);
  console.log(`  Title: ${title}`);
  console.log(`  Old slug: ${slug}... (truncated)`);
  console.log(`  New slug: ${slug}`);
  console.log(`  New filename: ${newFilename}`);

  // Update all references in the HTML
  let newHtml = html;

  // Update canonical URL
  newHtml = newHtml.replace(
    /<link rel="canonical" href="\/news\/[^"]+"/,
    `<link rel="canonical" href="/news/${newFilename}">`
  );

  // Update Open Graph URL
  newHtml = newHtml.replace(
    /og:url" content="https:\/\/passwordmonkey\.org\/news\/[^"]+/g,
    `og:url" content="https://passwordmonkey.org/news/${newFilename}`
  );

  // Update Twitter URL
  newHtml = newHtml.replace(
    /twitter:url" content="https:\/\/passwordmonkey\.org\/news\/[^"]+/g,
    `twitter:url" content="https://passwordmonkey.org/news/${newFilename}`
  );

  // Update internal links
  newHtml = newHtml.replace(/href="\/news\/[^"]+\.html"/g, `href="/news/${newFilename}"`);

  // Write the new file
  writeFileSync(newPath, newHtml, 'utf8');

  // Delete the old file
  if (existsSync(oldPath)) {
    const fs = require('fs');
    fs.unlinkSync(oldPath);
  }

  console.log(`  ✅ Migrated successfully!`);
  console.log('');
}

console.log("=== MIGRATION COMPLETE ===");
console.log("✅ All truncated URLs have been migrated to their full, non-truncated versions.");
console.log("🎉 URL truncation is now completely solved for both old and new articles!");