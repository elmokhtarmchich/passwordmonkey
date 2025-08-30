const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');
const articlesJsonPath = path.join(newsDir, 'articles.json');

// Read articles.json
const articlesJson = JSON.parse(fs.readFileSync(articlesJsonPath, 'utf8'));

// Process each article from yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

// Update each article
articlesJson.articles.forEach(article => {
    const articleDate = article.publishDate.split('T')[0];
    if (articleDate === yesterdayStr) {
        const articlePath = path.join(newsDir, article.filename);
        let content = fs.readFileSync(articlePath, 'utf8');

        // Calculate reading time
        const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

        // Update reading time in the HTML
        content = content.replace(
            /<span>(\d+) min read<\/span>/,
            `<span>${readingTime} min read</span>`
        );

        // Update article metadata
        content = content.replace(
            /"readingTime":\s*\d+/,
            `"readingTime": ${readingTime}`
        );

        // Save updated article
        fs.writeFileSync(articlePath, content);

        // Update reading time in articles.json
        article.readingTime = readingTime;
    }
});

// Save updated articles.json
fs.writeFileSync(articlesJsonPath, JSON.stringify(articlesJson, null, 2));

console.log('Articles updated successfully');
