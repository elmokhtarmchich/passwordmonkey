#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://passwordmonkey.org';
const NEWS_PATH = '/news/';

function readFileSafe(filePath) {
	try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

function extractBetween(content, startTag, endTag) {
	const start = content.indexOf(startTag);
	if (start === -1) return '';
	const end = content.indexOf(endTag, start + startTag.length);
	if (end === -1) return '';
	return content.substring(start + startTag.length, end).trim();
}

function extractTitle(html) {
	return extractBetween(html, '<title>', '</title>') || '';
}

function extractMetaContent(html, nameAttr) {
	const regex = new RegExp(`<meta[^>]*name=["']${nameAttr}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
	const match = html.match(regex);
	return match ? match[1].trim() : '';
}

function extractFirstParagraph(html) {
	const pStart = html.toLowerCase().indexOf('<p');
	if (pStart === -1) return '';
	const closeStart = html.indexOf('>', pStart);
	if (closeStart === -1) return '';
	const pEnd = html.toLowerCase().indexOf('</p>', closeStart + 1);
	if (pEnd === -1) return '';
	const inner = html.substring(closeStart + 1, pEnd).replace(/<[^>]*>/g, '').trim();
	return inner;
}

function toRfc1123(date) {
	return new Date(date).toUTCString();
}

function toYmd(date) {
	const d = new Date(date);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

function escapeXml(str) {
	return (str || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function buildSitemapXml(items) {
	const urls = items.map(item => `  <url>
    <loc>${SITE_URL}${item.url}</loc>
    <lastmod>${escapeXml(item.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRssXml(items) {
	const channelTitle = 'Password Security News | Password Monkey';
	const channelLink = `${SITE_URL}${NEWS_PATH}`;
	const channelDesc = 'Latest password security updates, data breaches, and cybersecurity news curated by Password Monkey.';
	const now = new Date().toUTCString();

	const entries = items.map(item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${SITE_URL}${item.url}</link>
      <pubDate>${toRfc1123(item.pubDate || item.date)}</pubDate>
      <description>${escapeXml(item.description || '')}</description>
    </item>`).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml(channelDesc)}</description>
    <lastBuildDate>${now}</lastBuildDate>
${entries}
  </channel>
</rss>
`;
}

function main() {
	const repoRoot = path.resolve(__dirname, '..');
	const newsDir = path.join(repoRoot, 'news');
	if (!fs.existsSync(newsDir)) {
		console.error('News directory not found:', newsDir);
		process.exit(1);
	}

	const files = fs.readdirSync(newsDir)
		.filter(f => f.toLowerCase().endsWith('.html'))
		.filter(f => f.toLowerCase() !== 'index.html');

	const items = files.map(filename => {
		const fullPath = path.join(newsDir, filename);
		const html = readFileSafe(fullPath);
		const stat = fs.statSync(fullPath);
		const title = extractTitle(html);
		const description = extractMetaContent(html, 'description') || extractFirstParagraph(html) || '';
		let date = extractMetaContent(html, 'date');
		if (!date) date = toYmd(stat.mtime);
		return {
			title,
			description,
			date: toYmd(date),
			pubDate: toRfc1123(date),
			url: `${NEWS_PATH}${filename}`
		};
	});

	// Sort newest first
	items.sort((a, b) => new Date(b.date) - new Date(a.date));

	// Write sitemap.xml and rss.xml
	const sitemapXml = buildSitemapXml(items);
	const rssXml = buildRssXml(items);

	fs.writeFileSync(path.join(newsDir, 'sitemap.xml'), sitemapXml, 'utf8');
	fs.writeFileSync(path.join(newsDir, 'rss.xml'), rssXml, 'utf8');
	console.log(`Generated sitemap.xml and rss.xml for ${items.length} items.`);
}

if (require.main === module) {
	main();
}