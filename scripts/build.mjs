import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const MAX_INCLUDE_DEPTH = 8;

const ROOT_FILES = [
    '1d7b7c44e69cda6053b8da38052112a2.txt',
    '404.html',
    'about.html',
    'about.md',
    'donate.html',
    'donate.md',
    'faq.html',
    'faq.md',
    'index.html',
    'llms.txt',
    'manifest.json',
    'password-security-guide.html',
    'password-security-guide.md',
    'privacy.html',
    'privacy.md',
    'robots.txt',
    'script.js',
    'seo.json',
    'service-worker.js',
    'sitemap.xml',
    'style.css',
    'sidebar.css',
    'kilo-typography.css',
    'validate-agentic.js',
    'webmcp-tools.js',
    'webmcp-tools.md',
    'yandex_e8438f6f6907ddd1.html',
    'ahrefs_1de5b65148f02f6b479edaf4c598a1ed31c1ae272b87831fc6f5a6400025bf4c',
    '_redirects',
];

const DIRS = ['favicon_io', 'fonts', 'images', 'js', 'news'];

const MARKER_RE = /<!--@include\s+([^\s>]+)((?:\s+[a-zA-Z][\w-]*=(?:"[^"]*"|[^\s>]+))*)\s*-->/g;
const GUARD_RE = /<!--@if\s+([a-zA-Z][\w-]*)-->([\s\S]*?)<!--@endif-->/g;
const TOKEN_RE = /\{[a-zA-Z][\w-]*\}/g;
const DIRECTIVE_LEFTOVER_RE = /<!--@(?:include|if|endif)/;
const NAV_SENTINEL_RE = / data-pm-nav="[^"]*"/g;

const stats = { files: 0, transformed: 0, copied: 0, includes: 0, news: 0, share: 0, related: 0, prevnext: 0, cta: 0, terms: 0 };
const warnings = [];

function parseParams(raw) {
    const params = {};
    const re = /([a-zA-Z][\w-]*)=("[^"]*"|[^\s>]+)/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
        params[m[1]] = m[2].startsWith('"') ? m[2].slice(1, -1) : m[2];
    }
    return params;
}

function isTruthy(value) {
    return value !== undefined && value !== '' && value !== '0' && value !== 'false';
}

function applyTokens(text, params, where) {
    return text.replace(TOKEN_RE, (token) => {
        const key = token.slice(1, -1);
        if (!(key in params)) {
            throw new Error(`unresolved token ${token} in ${where} (available params: ${Object.keys(params).join(', ') || 'none'})`);
        }
        return params[key];
    });
}

function applyGuards(text, params, where) {
    const opens = (text.match(/<!--@if\s/g) || []).length;
    const closes = (text.match(/<!--@endif-->/g) || []).length;
    const pairs = (text.match(new RegExp(GUARD_RE.source, 'g')) || []).length;
    if (opens !== pairs || closes !== pairs) {
        throw new Error(`unbalanced @if/@endif guards in ${where} (opens=${opens}, closes=${closes}, matched pairs=${pairs})`);
    }
    return text.replace(new RegExp(GUARD_RE.source, 'g'), (_, name, body) => (isTruthy(params[name]) ? body : ''));
}

function applyActiveNav(text, params, where) {
    if (params.active === undefined) return text;
    if (params.active !== 'none') {
        const needle = `data-pm-nav="${params.active}"`;
        const hits = text.split(needle).length - 1;
        if (hits !== 1) {
            throw new Error(`active="${params.active}" matched ${hits} nav links in ${where} (expected exactly 1)`);
        }
        text = text.replace(needle, 'class="active" aria-current="page"');
    }
    return text.replace(NAV_SENTINEL_RE, '');
}

function expandIncludes(text, params, chain, where) {
    return text.replace(new RegExp(MARKER_RE.source, 'g'), (_, rawPath, rawParams) => {
        if (!rawPath.startsWith('partials/') || rawPath.includes('..')) {
            throw new Error(`include path "${rawPath}" in ${where} must start with partials/ and stay inside it`);
        }
        const absPath = join(ROOT, rawPath);
        if (!existsSync(absPath) || !statSync(absPath).isFile()) {
            throw new Error(`include target not found: ${rawPath} (referenced in ${where})`);
        }
        if (chain.includes(absPath)) {
            throw new Error(`circular include via ${rawPath} (referenced in ${where})`);
        }
        if (chain.length >= MAX_INCLUDE_DEPTH) {
            throw new Error(`include depth exceeds ${MAX_INCLUDE_DEPTH} at ${rawPath} (referenced in ${where})`);
        }
        const childParams = { ...params, ...parseParams(rawParams) };
        let child = readFileSync(absPath, 'utf8');
        child = applyTokens(child, childParams, rawPath);
        child = applyGuards(child, childParams, rawPath);
        child = expandIncludes(child, childParams, [...chain, absPath], rawPath);
        child = applyActiveNav(child, childParams, rawPath);
        stats.includes += 1;
        return child;
    });
}

function transformPage(srcAbs, rel) {
    const raw = readFileSync(srcAbs, 'utf8');
    if (!/<!--@include\s/.test(raw) && !/<!--@if\s/.test(raw)) return false;
    let out = expandIncludes(raw, {}, [srcAbs], rel);
    if (DIRECTIVE_LEFTOVER_RE.test(out)) {
        throw new Error(`unprocessed build directive left in output of ${rel}`);
    }
    const leftovers = out.match(/(?<!\$)\{[a-zA-Z][\w-]*\}/g);
    if (leftovers) {
        throw new Error(`unresolved tokens in ${rel}: ${[...new Set(leftovers)].join(', ')}`);
    }
    writeFileSync(join(DIST, rel), out);
    return true;
}

function walkDir(relDir) {
    const out = [];
    const stack = [relDir];
    while (stack.length) {
        const cur = stack.pop();
        for (const entry of readdirSync(join(ROOT, cur), { withFileTypes: true })) {
            const rel = `${cur}/${entry.name}`;
            if (entry.isDirectory()) stack.push(rel);
            else out.push(rel);
        }
    }
    return out;
}

// ---- News article enrichment (NEWS-UX-1) ----
// Applied to real news article pages (news/YYYY-MM-DD-slug-<6hex>.html) after include
// expansion, on the final output string, before it lands in dist/. Covers all existing
// articles and every future pipeline article with zero template changes.

const NEWS_ARTICLE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+-[0-9a-f]{6}\.html$/;
const STOPWORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'on', 'at', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'with', 'from',
    'that', 'this', 'it', 'its', 'into', 'more', 'than', 'over', 'after', 'new', 'how', 'why', 'what', 'when', 'who', 'heres', 'here',
    'says', 'said', 'gets', 'get', 'used', 'using', 'use', 'your', 'you', 'their', 'they', 'not', 'but', 'can', 'could', 'will', 'would',
    'has', 'have', 'had', 'may', 'might', 'now', 'two', 'one', 'first', 'best', 'key', 'top'
]);

let newsManifestCache = null;

function isNewsArticle(rel) {
    return rel.startsWith('news/') && NEWS_ARTICLE_RE.test(rel.slice('news/'.length));
}

function getNewsManifest() {
    if (newsManifestCache !== null) return newsManifestCache;
    const manifestPath = join(ROOT, 'news', 'news-manifest.json');
    if (!existsSync(manifestPath) || !statSync(manifestPath).isFile()) {
        throw new Error('news manifest not found: news/news-manifest.json');
    }
    const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const articles = [];
    for (const entry of parsed.articles || []) {
        if (!entry || !entry.file) continue;
        if (!existsSync(join(ROOT, 'news', entry.file))) {
            warnings.push(`news-manifest.json lists missing file news/${entry.file} - entry ignored`);
            continue;
        }
        articles.push(entry);
    }
    newsManifestCache = { articles };
    return newsManifestCache;
}

const NAMED_ENTITIES = {
    nbsp: ' ', quot: '"', apos: "'", hellip: '\u2026', rsquo: '\u2019', lsquo: '\u2018',
    rdquo: '\u201d', ldquo: '\u201c', mdash: '\u2014', ndash: '\u2013', copy: '\u00a9', reg: '\u00ae'
};

function safeFromCodePoint(code) {
    try {
        return String.fromCodePoint(code);
    } catch (err) {
        return '';
    }
}

function decodeHtmlEntities(text) {
    return String(text)
        .replace(/&([a-zA-Z]+);/g, (full, name) => {
            const key = name.toLowerCase();
            return key in NAMED_ENTITIES ? NAMED_ENTITIES[key] : full;
        })
        .replace(/&#x([0-9a-fA-F]+);/g, (full, hex) => safeFromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (full, dec) => safeFromCodePoint(parseInt(dec, 10)))
        .replace(new RegExp('&' + 'amp;', 'g'), '&');
}
function stripTitleSuffix(title) {
    return decodeHtmlEntities(String(title || '')).replace(/\s*\|\s*Password Monkey\s*$/, '').trim();
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&' + 'amp;')
        .replace(/</g, '&' + 'lt;')
        .replace(/>/g, '&' + 'gt;')
        .replace(/"/g, '&' + 'quot;');
}

function cleanArticleUrl(filename) {
    return `https://passwordmonkey.org/news/${filename.replace(/\.html$/, '')}`;
}

function formatPublishedDate(published) {
    const date = new Date(`${published}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return published;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function pageTitleFromHtml(html) {
    const match = html.match(/<title>([^<]*)<\/title>/);
    return match ? stripTitleSuffix(match[1]) : '';
}

function decodeBasicEntities(text) {
    return text
        .replace(/&nbsp;/g, ' ')
        .replace(/&(?:hellip|#8230|#x2026);/gi, '\u2026')
        .replace(new RegExp('&' + 'amp;', 'g'), '&');
}

function tokenizeArticle(article) {
    const tokens = String(`${article.title || ''} ${article.description || ''}`)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
    return new Set(tokens);
}

function enrichShare(html, filename, title, where) {
    const url = cleanArticleUrl(filename);
    const shareTargets = [
        ['Share on Twitter', `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`],
        ['Share on Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`],
        ['Share on LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`],
    ];
    for (const [label, shareUrl] of shareTargets) {
        const anchorRe = new RegExp(`<a href="([^"]*)"([^>]*)aria-label="${label}">`, 'g');
        const matches = [...html.matchAll(anchorRe)];
        if (matches.length !== 1) {
            throw new Error(`${where}: share anchor "${label}" matched ${matches.length} anchors (expected exactly 1)`);
        }
        const [, href, middle] = matches[0];
        if (href === '#') {
            html = html.replace(anchorRe, () => `<a href="${shareUrl}" target="_blank" rel="noopener"${middle}aria-label="${label}">`);
            stats.share += 1;
        } else if (!/^https?:\/\//.test(href)) {
            throw new Error(`${where}: share anchor "${label}" has unexpected href "${href}"`);
        }
    }
    return html;
}

function computeRelated(currentFile, currentTitle, currentDescription) {
    const { articles } = getNewsManifest();
    const others = articles.filter((article) => article.file !== currentFile);
    if (others.length === 0) return [];
    const currentTokens = tokenizeArticle({ title: currentTitle, description: currentDescription });
    const df = new Map();
    for (const article of articles) {
        for (const token of tokenizeArticle(article)) {
            df.set(token, (df.get(token) || 0) + 1);
        }
    }
    const commonLimit = articles.length * 0.3;
    const scoringTokens = new Set([...currentTokens].filter((token) => (df.get(token) || 0) <= commonLimit));
    const scored = [];
    for (const article of others) {
        let score = 0;
        for (const token of tokenizeArticle(article)) {
            if (scoringTokens.has(token)) score += 1;
        }
        if (score >= 2) scored.push({ article, score });
    }
    if (scored.length === 0) {
        return [...others]
            .sort((x, y) => y.published.localeCompare(x.published) || y.file.localeCompare(y.file))
            .slice(0, 2);
    }
    scored.sort((x, y) => (y.score - x.score)
        || y.article.published.localeCompare(x.article.published)
        || x.article.file.localeCompare(y.article.file));
    return scored.slice(0, 3).map((entry) => entry.article);
}

function renderRelatedCard(article) {
    const title = escapeHtml(stripTitleSuffix(article.title || ''));
    return `                    <a href="${cleanArticleUrl(article.file)}" class="block bg-white dark:bg-raised rounded-xl border border-gray-200 dark:border-[#333333] p-5 hover:border-blue-400 dark:hover:border-blue-400 transition group">
                        <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">${title}</h3>
                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <i class="fas fa-calendar-alt"></i><span>${formatPublishedDate(article.published)}</span>
                            <span>&middot;</span>
                            <i class="fas fa-clock"></i><span>${escapeHtml(article.readTime || '')}</span>
                        </div>
                    </a>`;
}

function findMatchingDivClose(html, openIndex) {
    const tagRe = /<\/?div\b/g;
    tagRe.lastIndex = openIndex;
    let depth = 0;
    let match;
    while ((match = tagRe.exec(html)) !== null) {
        depth += match[0].startsWith('</') ? -1 : 1;
        if (depth === 0) return match.index + match[0].length + 1;
    }
    return -1;
}

function enrichRelated(html, filename, entry, where) {
    const gridOpen = '<div class="grid md:grid-cols-2 gap-6">';
    const count = html.split(gridOpen).length - 1;
    if (count !== 1) {
        throw new Error(${where}: related-articles grid matched  (expected exactly 1));
    }
    const related = computeRelated(filename, entry.title || '', entry.description || '');
    if (related.length === 0) {
        warnings.push(`${where}: no related articles available`);
        return html;
    }
    const openIndex = html.indexOf(gridOpen);
    const closeIndex = findMatchingDivClose(html, openIndex);
    if (closeIndex === -1) {
        throw new Error(`${where}: related-articles grid has unbalanced <div> tags`);
    }
    const cards = related.map(renderRelatedCard).join('\n');
    const grid = `<div class="grid md:grid-cols-2 gap-6">\n${cards}\n                </div>`;
    html = html.slice(0, openIndex) + grid + html.slice(closeIndex);
    stats.related += 1;
    return html;
}

function computeNeighbors(currentFile) {
    const { articles } = getNewsManifest();
    const ordered = [...articles].sort((x, y) => x.published.localeCompare(y.published) || x.file.localeCompare(y.file));
    const index = ordered.findIndex((article) => article.file === currentFile);
    if (index === -1) return null;
    return {
        older: index > 0 ? ordered[index - 1] : null,
        newer: index < ordered.length - 1 ? ordered[index + 1] : null,
    };
}

function renderNavSlot(article, direction) {
    const label = direction === 'older'
        ? '<i class="fas fa-arrow-left mr-1"></i> Older'
        : 'Newer <i class="fas fa-arrow-right ml-1"></i>';
    if (article) {
        const title = escapeHtml(stripTitleSuffix(article.title || ''));
        const align = direction === 'older' ? '' : ' text-right';
        return `                    <a href="${cleanArticleUrl(article.file)}" class="group flex flex-col gap-1 bg-white dark:bg-raised rounded-xl border border-gray-200 dark:border-[#333333] p-4 hover:border-blue-400 dark:hover:border-blue-400 transition${align}">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">${label}</span>
                        <span class="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">${title}</span>
                    </a>`;
    }
    const text = direction === 'older' ? 'You&rsquo;re reading the oldest article' : 'You&rsquo;re reading the newest article';
    return `                    <div class="flex flex-col gap-1 rounded-xl border border-gray-200 dark:border-[#333333] p-4 opacity-50 select-none" aria-disabled="true">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">${label}</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">${text}</span>
                    </div>`;
}

function enrichPrevNext(html, filename, where) {
    const neighbors = computeNeighbors(filename);
    if (neighbors === null) {
        warnings.push(`${where}: no ordered position in manifest - prev/next skipped`);
        return html;
    }
    const comment = '<!-- Back to News Button -->';
    const count = html.split(comment).length - 1;
    if (count !== 1) {
        throw new Error(`${where}: "Back to News Button" comment matched ${count} (expected exactly 1)`);
    }
    const navBlock = `<!-- Prev/Next Article Navigation -->
            <nav class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Article navigation">
${renderNavSlot(neighbors.older, 'older')}
${renderNavSlot(neighbors.newer, 'newer')}
            </nav>

            `;
    html = html.replace(comment, `${navBlock}${comment}`);
    stats.prevnext += 1;
    return html;
}

function enrichTruncationCta(html, where) {
    const bodyOpen = '<div class="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">';
    const openCount = html.split(bodyOpen).length - 1;
    if (openCount !== 1) {
        throw new Error(`${where}: article body container matched ${openCount} (expected exactly 1)`);
    }
    const bodyCloseRe = /<\/div>(\s*<!-- Article Footer -->)/g;
    const closeMatches = [...html.matchAll(bodyCloseRe)];
    if (closeMatches.length !== 1) {
        throw new Error(`${where}: article body closing boundary matched ${closeMatches.length} (expected exactly 1)`);
    }
    const openIndex = html.indexOf(bodyOpen) + bodyOpen.length;
    const closeIndex = closeMatches[0].index;
    if (closeIndex <= openIndex) {
        throw new Error(`${where}: article body boundaries are inverted`);
    }
    const inner = html.slice(openIndex, closeIndex);
    const text = decodeBasicEntities(inner.replace(/<[^>]*>/g, ' ')).trim();
    if (text.length === 0) return html;
    if (/[.!?:;"'\u201d\u2019\u2026\]\)]$/.test(text)) return html;
    const sourceMatch = html.match(/Source: <a href="([^"]+)"[^>]*>([^<]*)<\/a>/);
    if (!sourceMatch) {
        warnings.push(`${where}: no source anchor found - skipped continue-reading CTA`);
        return html;
    }
    const ctaBlock = `<p>&hellip;</p>
                    <div class="mt-6"><a href="${sourceMatch[1]}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition">Continue reading at ${escapeHtml(sourceMatch[2].trim())}<i class="fas fa-external-link-alt text-sm ml-1"></i></a></div>
                `;
    html = html.replace(bodyCloseRe, (match, tail) => `${ctaBlock}</div>${tail}`);
    stats.cta += 1;
    return html;
}

function enrichNewsArticle(html, rel) {
    const filename = rel.slice('news/'.length);
    const entry = getNewsManifest().articles.find((article) => article.file === filename) || null;
    const title = entry ? stripTitleSuffix(entry.title || '') : pageTitleFromHtml(html);
    html = enrichShare(html, filename, title, rel);
    if (entry) {
        html = enrichRelated(html, filename, entry, rel);
        html = enrichPrevNext(html, filename, rel);
    } else {
        warnings.push(`${rel}: not found in news-manifest.json - related/prev-next skipped`);
    }
    html = enrichTruncationCta(html, rel);
    const scriptNeedle = '<script src="../script.js" defer></script>';
    const scriptHits = html.split(scriptNeedle).length - 1;
    if (scriptHits !== 1) {
        throw new Error(`${rel}: script.js tag matched ${scriptHits} (expected exactly 1)`);
    }
    html = html.replace(scriptNeedle, `${scriptNeedle}\n<script src="../js/news-terms.js" defer></script>`);
    stats.terms += 1;
    stats.news += 1;
    return html;
}

function main() {
    getNewsManifest();
    const files = [...ROOT_FILES, ...DIRS.flatMap(walkDir)];
    rmSync(DIST, { recursive: true, force: true });
    mkdirSync(DIST, { recursive: true });
    for (const rel of files) {
        const src = join(ROOT, rel);
        if (!existsSync(src)) {
            throw new Error(`deploy list entry missing on disk: ${rel}`);
        }
        mkdirSync(dirname(join(DIST, rel)), { recursive: true });
        if (/\.html?$/i.test(rel) && transformPage(src, rel)) {
            stats.transformed += 1;
        } else {
            copyFileSync(src, join(DIST, rel));
            stats.copied += 1;
        }
        if (isNewsArticle(rel)) {
            const distPath = join(DIST, rel);
            writeFileSync(distPath, enrichNewsArticle(readFileSync(distPath, 'utf8'), rel));
        }
        stats.files += 1;
    }
    for (const warning of warnings) {
        console.warn(`WARN: ${warning}`);
    }
    console.log(`Built ${stats.files} files -> dist/ (${stats.transformed} pages transformed, ${stats.includes} includes resolved, ${stats.copied} copied byte-identical)`);
        console.log(`news articles enriched: ${stats.news} (share: ${stats.share}, related: ${stats.related}, prevnext: ${stats.prevnext}, cta: ${stats.cta}, terms: ${stats.terms})`);
}

try {
    main();
} catch (err) {
    console.error(`BUILD FAILED: ${err.message}`);
    process.exit(1);
}
