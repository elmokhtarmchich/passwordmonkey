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

const stats = { files: 0, transformed: 0, copied: 0, includes: 0 };

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

function main() {
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
        stats.files += 1;
    }
    console.log(`Built ${stats.files} files -> dist/ (${stats.transformed} pages transformed, ${stats.includes} includes resolved, ${stats.copied} copied byte-identical)`);
}

try {
    main();
} catch (err) {
    console.error(`BUILD FAILED: ${err.message}`);
    process.exit(1);
}
