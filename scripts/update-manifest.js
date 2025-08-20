#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readFileSafe(filePath) {
	try {
		return fs.readFileSync(filePath, 'utf8');
	} catch (e) {
		return '';
	}
}

function extractBetween(content, startTag, endTag) {
	const start = content.indexOf(startTag);
	if (start === -1) return '';
	const end = content.indexOf(endTag, start + startTag.length);
	if (end === -1) return '';
	return content.substring(start + startTag.length, end).trim();
}

function extractTitle(html) {
	// Extract content between <title> and </title>
	const title = extractBetween(html, '<title>', '</title>');
	return title || '';
}

function extractMetaContent(html, nameAttr) {
	// Simple regex to match <meta name="X" content="Y">
	const regex = new RegExp(`<meta[^>]*name=["']${nameAttr}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
	const match = html.match(regex);
	return match ? match[1].trim() : '';
}

function formatDateYmd(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function main() {
	const repoRoot = path.resolve(__dirname, '..');
	const newsDir = path.join(repoRoot, 'news');
	const outPath = path.join(newsDir, 'news-manifest.json');

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

		const rawTitle = extractTitle(html);
		const description = extractMetaContent(html, 'description') || '';
		let dateStr = extractMetaContent(html, 'date');
		if (!dateStr) {
			const stat = fs.statSync(fullPath);
			dateStr = formatDateYmd(stat.mtime);
		}

		return {
			title: rawTitle,
			description: description,
			date: dateStr,
			url: `/news/${filename}`
		};
	});

	// Sort newest first by date
	items.sort((a, b) => new Date(b.date) - new Date(a.date));

	fs.writeFileSync(outPath, JSON.stringify(items, null, 2) + '\n', 'utf8');
	console.log(`Updated manifest with ${items.length} articles -> ${outPath}`);
}

if (require.main === module) {
	main();
}