const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');
const articlesJsonPath = path.join(newsDir, 'articles.json');
const manifestJsonPath = path.join(newsDir, 'news-manifest.json');

// Read both files
const articles = require(articlesJsonPath);
const manifest = require(manifestJsonPath);

// Create map of article reading times by URL
const readingTimes = {};
articles.articles.forEach(article => {
    // Extract filename from full path
    const filename = article.filename.split('/').pop();
    readingTimes[filename] = article.readingTime;
});

// Update manifest with reading times
manifest.forEach(item => {
    // Extract filename from URL
    const filename = item.url.split('/').pop();
    if (readingTimes[filename]) {
        item.readingTime = readingTimes[filename];
    }
});

// Write updated manifest
fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2));

console.log('Reading times updated in news-manifest.json');
