const fs = require('fs');
const path = require('path');

function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const text = content
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const words = text.split(' ').filter(Boolean).length;
    return Math.ceil(words / wordsPerMinute);
}

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function extractDate(html, file) {
    const metaMatch = html.match(
        /<meta\s+name=["']date["']\s+content=["'](\d{4}-\d{2}-\d{2})["']/i
    );
    if (metaMatch) return metaMatch[1];

    const filenameMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
    return filenameMatch ? filenameMatch[1] : null;
}

function extractTitle(html) {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!match) return null;

    return match[1].replace(/\s*\|\s*Password\s*Monkey.*$/i, '').trim();
}

function titleFromFile(file) {
    return file
        .replace(/^\d{4}-\d{2}-\d{2}-/, '')
        .replace(/\.html$/i, '')
        .replace(/-[a-f0-9]{6}$/i, '')
        .replace(/-/g, ' ');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function processArticles() {
    const newsDir = path.join(__dirname, '../news');
    const articles = fs.readdirSync(newsDir)
        .filter(file => file.endsWith('.html') && !file.startsWith('index') && file !== 'article-template.html')
        .map(file => {
            const content = fs.readFileSync(path.join(newsDir, file), 'utf8');
            const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
            const date = dateMatch ? dateMatch[1] : null;

            return {
                file,
                date,
                content,
                title: extractTitle(content) || titleFromFile(file),
                readingTime: calculateReadingTime(content)
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    const articleLinks = articles.map(article => `
        <article class="news-preview">
            <h2>${escapeHtml(article.title)}</h2>
            <div class="meta-info">
                <time datetime="${article.date}">${formatDate(article.date)}</time>
                <span class="reading-time">${article.readingTime} min read</span>
            </div>
            <a href="${article.file}" class="read-more">Read article</a>
        </article>
    `).join('\n');

    const itemListElements = articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://passwordmonkey.org/news/${article.file}`,
        name: article.title
    }));

    let indexContent = fs.readFileSync(path.join(newsDir, 'index.html'), 'utf8');
    const structuredDataMatch = indexContent.match(
        /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/
    );

    if (!structuredDataMatch) {
        throw new Error('NewsPage structured data not found in index.html');
    }

    const structuredData = JSON.parse(structuredDataMatch[2]);
    structuredData.mainEntity.numberOfItems = articles.length;
    structuredData.mainEntity.itemListElement = itemListElements;

    indexContent = indexContent.replace(
        structuredDataMatch[0],
        `${structuredDataMatch[1]}\n${JSON.stringify(structuredData, null, 4)}\n${structuredDataMatch[3]}`
    );
    indexContent = indexContent.replace(
        /(<div class="articles-grid">)[\s\S]*?(<\/div>\s*<\/main>)/,
        `$1${articleLinks}$2`
    );
    fs.writeFileSync(path.join(newsDir, 'index.html'), indexContent);
}

processArticles();
