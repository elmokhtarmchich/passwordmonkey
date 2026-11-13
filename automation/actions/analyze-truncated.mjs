#!/usr/bin/env node

import { readFileSync } from "fs";

const newsDir = "../news";
const files = [
  "2026-11-09-cisa-flags-sonicwall-sonicos-mfa-bypass-flaw-amid--4d02c2.html",
  "2026-11-09-default-adminadmin-server-password-helps-researche-3b7113.html",
  "2026-11-09-hackers-exploiting-sshole-authentication-bypass-in-52cb49.html",
  "2026-11-09-iris-plaza-breach-may-have-exposed-data-of-77-mill-b475f3.html",
  "2026-11-09-over-3-million-people-hit-by-frontline-education-d-1fded0.html",
  "2026-11-09-revolve-puts-data-breach-victim-count-at-15-millio-97dd5a.html",
];

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
  const match = html.match(/<title>(.*?)<\/title>/);
  return match ? match[1] : null;
}

files.forEach(filename => {
  try {
    const html = readFileSync(`../news/${filename}`, 'utf8');
    const title = extractTitle(html);
    const hash = filename.split('-').pop().replace('.html', '');

    console.log(`\n${filename}`);
    console.log(`  Title: ${title?.substring(0, 75)}${title?.length > 75 ? '...' : ''}`);
    console.log(`  Current: ${filename}`);
    console.log(`  Should be: 2026-11-09-${slugify(title)}-${hash}.html`);
  } catch (err) {
    console.log(`\n${filename} - ERROR: File not found`);
  }
});
