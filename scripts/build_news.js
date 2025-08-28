const fs = require('fs');
const path = require('path');

function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

function processArticles() {
    const newsDir = path.join(__dirname, '../news');
    const articles = fs.readdirSync(newsDir)
        .filter(file => file.endsWith('.html') && !file.startsWith('index'))
        .map(file => {
            const content = fs.readFileSync(path.join(newsDir, file), 'utf8');
            const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : null;
            
            return {
                file,
                date,
                content,
                readingTime: calculateReadingTime(content)
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    // Update index.html with sorted articles
    const articleLinks = articles.map(article => `
        <article class="news-preview">
            <h2>${article.title}</h2>
            <div class="meta-info">
                <time datetime="${article.date}">${formatDate(article.date)}</time>
                <span class="reading-time">${article.readingTime} min read</span>
            </div>
            <a href="${article.file}" class="read-more">Read article</a>
        </article>
    `).join('\n');

    // Insert into index.html
    let indexContent = fs.readFileSync(path.join(newsDir, 'index.html'), 'utf8');
    indexContent = indexContent.replace('<!-- Articles will be dynamically inserted here by the build script -->', articleLinks);
    fs.writeFileSync(path.join(newsDir, 'index.html'), indexContent);
}

processArticles();
