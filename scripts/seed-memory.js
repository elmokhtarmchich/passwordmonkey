/**
 * seed-memory.js — Cold-start PasswordMonkey's TDAI memory.
 *
 * Captures the project's editorial conventions, template rules, SEO requirements,
 * and workflow knowledge so any future coding agent starts with the save file
 * instead of re-learning from scratch.
 *
 * Usage:  node scripts/seed-memory.js
 * Env:    TDAI_ENDPOINT, TDAI_API_KEY (defaults point at the local gateway)
 */

'use strict';

const mem = require('./memory-client.js');

const CONVENTIONS = [
    {
        role: 'user',
        content: [
            'PasswordMonkey is a static cybersecurity news and password-security education site (passwordmonkey.org).',
            'No build step. Served via lite-server for local dev (npm start).',
            'Dark theme with Matrix-style typography (MatrixtypeDisplay font).',
            'Articles generated from RSS/cybersecurity feeds.',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. PasswordMonkey is a zero-build static site; never introduce a bundler or build step.',
            'Use lite-server for local preview only (npm start).',
            'Preserve the dark Matrix aesthetic — MatrixtypeDisplay font, dark background.',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'News article filename convention: YYYY-MM-DD-title-hash.html (e.g. 2025-01-15-password-manager-comparison.html).',
            'Articles live in the news/ directory.',
            'Every article must be built from article_template.html (master copy — never delete it).',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. New articles: cp article_template.html news/YYYY-MM-DD-title-hash.html, then fill placeholders.',
            'Never delete article_template.html — it is the master copy.',
            'All article filenames match YYYY-MM-DD-title-hash.html.',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'SEO requirements per article: title tag "[Article Title] | Password Monkey",',
            'meta description 150-160 chars, meta date YYYY-MM-DD, JSON-LD NewsArticle schema,',
            'og:image and twitter:image meta tags, canonical URL, proper meta robots tags.',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. Every article must include: <title> | Password Monkey, meta description (150-160 chars),',
            'meta date YYYY-MM-DD, JSON-LD NewsArticle schema, og:image + twitter:image, canonical URL.',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'Content structure: <header> and <footer> identical to main site, article wrapped in <main><article>...</article></main>,',
            'breadcrumb navigation, related articles section, reading-time span in format "<N> min read".',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. Article body: <main><article>...</article></main> with matching header/footer, breadcrumbs,',
            'related articles, and a reading-time span rendered as "<N> min read".',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'Automation scripts: build_news.js (rebuild news index + reading times), update-articles.js (yesterday reading-time update),',
            'update-manifest.js, merge-reading-times.js, generate-news-xml.js (RSS), news-aggregator.js,',
            'n8n-workflow.json + workflows/news-automation.json (automation pipeline).',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. Automation scripts live in scripts/: build_news.js, update-articles.js, update-manifest.js,',
            'merge-reading-times.js, generate-news-xml.js, news-aggregator.js, plus n8n workflow JSONs.',
            'build_news.js rebuilds news/index.html from sorted articles; update-articles.js patches yesterday\'s reading time.',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'Manifests to keep in sync: manifest.json, news-manifest.json, articles.json, content-types.json, seo.json, rss.xml, sitemap.xml.',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. Keep these JSON/XML manifests in sync after any article change: manifest.json, news-manifest.json,',
            'articles.json, content-types.json, seo.json, rss.xml, sitemap.xml.',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'Writing style: clear concise language, include relevant keywords naturally, break text with subheadings,',
            'use bullet points for lists, internal links to related content, optimize for users and SEO.',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. Writing style: clear/concise, natural keywords, subheadings, bullet lists, internal links,',
            'SEO-optimized but reader-first. Always include source attribution.',
        ].join(' '),
    },
    {
        role: 'user',
        content: [
            'Agent team roles for PasswordMonkey: You (decisions), Scout (research news),',
            'Builder (write code/articles), Reviewer (validate SEO/structure), Agent Memory (preserve experience).',
        ].join(' '),
    },
    {
        role: 'assistant',
        content: [
            'Noted. Role split: You=decisions, Scout=research, Builder=coding/articles,',
            'Reviewer=SEO/structure validation, Memory=preserve team experience.',
        ].join(' '),
    },
];

async function main() {
    const ok = await mem.health();
    if (!ok) {
        console.error('TDAI gateway is not reachable at', mem.constants.ENDPOINT);
        console.error('Start it first:  cd MemoryCore && node --import tsx src/gateway/server.ts');
        process.exit(1);
    }
    console.log('TDAI gateway OK at', mem.constants.ENDPOINT);

    let captured = 0;
    for (const turn of CONVENTIONS) {
        try {
            const res = await mem.captureConversation([turn], {
                sessionId: `pm-seed-${captured}`,
            });
            if (res && res.code === 0) captured++;
        } catch (err) {
            console.error('capture failed:', err.message);
        }
    }
    console.log(`Seeded ${captured}/${CONVENTIONS.length} conversation turns into TDAI memory.`);

    // Verify recall works
    const recall = await mem.recallMemory('article template SEO conventions filename');
    console.log('Recall test:', recall._offline ? 'OFFLINE' : `${(recall.data?.items || []).length} items`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});