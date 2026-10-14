// PasswordMonkey news pipeline � 1:1 port of automation/oci/workflows/LS41E1sQ0wNfjHYe-workflow_main.json
// Node 20 ESM. Run: node automation/actions/news-pipeline.mjs [--dry-run]

import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";
import https from "node:https";
import http from "node:http";

import Parser from "rss-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

const dryRun = process.argv.includes("--dry-run");

const FEEDS = [
  "https://thehackernews.com/feeds/posts/default?alt=rss",
  "https://www.securityweek.com/feed/",
  "https://www.bleepingcomputer.com/feed/",
  "https://krebsonsecurity.com/feed/",
  "https://www.darkreading.com/rss.xml",
  "https://threatpost.com/feed/",
  "https://techcrunch.com/feed/",
  "https://www.wired.com/feed/rss",
  "https://www.theverge.com/rss/index.xml",
  "https://www.engadget.com/rss.xml",
  "http://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "http://rss.cnn.com/rss/edition.rss"
];

const parser = new Parser({
  timeout: 15000,
  requestHeaders: { "User-Agent": "PasswordMonkey-News-Pipeline/1.0" }
});

function extractDomain(url) {
  if (!url) return "unknown";
  try {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    return match ? match[1] : "unknown";
  } catch (e) {
    return "unknown";
  }
}

function normalizeItem(rssItem) {
  return {
    source: extractDomain(rssItem.link),
    title: rssItem.title || "",
    link: rssItem.link || "",
    publishedAt: rssItem.pubDate || rssItem.published || new Date().toISOString(),
    author: rssItem.author || rssItem.creator || null,
    description: rssItem.description || rssItem.contentSnippet || rssItem.summary || null,
    content: rssItem.content || rssItem["content:encoded"] || rssItem.description || null
  };
}

const KEYWORDS = (process.env.NEWS_KEYWORDS || "password,breach,authentication,cybersecurity")
  .toLowerCase()
  .split(",")
  .map((k) => k.trim());

function keywordMatches(item) {
  const textToSearch = [item.title || "", item.description || "", item.content || ""].join(" ").toLowerCase();
  return KEYWORDS.some((keyword) => {
    const regex = new RegExp("\\b" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return regex.test(textToSearch);
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export function buildArticleHtml(item) {
  const readingTime = item.readingTime || 5;
  const dateFormatted = item.dateFormatted;
  const dateISO = item.dateISO;

  const hash = crypto.createHash("sha256").update(item.link).digest("hex").substring(0, 6);

  const publishDate = new Date(item.publishedAt);
  const publishDateYMD = publishDate.toISOString().split("T")[0];
  const publishDateHuman = publishDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const publishDateISO = `${publishDateYMD}T12:00:00Z`;

  const slug = slugify(item.title).trim();
  const filename = `${publishDateYMD}-${slug}-${hash}.html`.trim();

  const description = (item.summaryContent || item.description || item.title)
    .replace(/<[^>]*>/g, "")
    .substring(0, 160)
    .replace(/\s+$/, "");

  let bodyHtml = item.summaryContent || item.content || item.description || "";
  if (!bodyHtml.includes("<p>")) {
    bodyHtml = `<p>${bodyHtml}</p>`;
  }

  const proxyBase = "https://www.passwordmonkey.org/rss?url=";
  const proxiedLink = proxyBase + encodeURIComponent(item.link);



  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${item.title} | Password Monkey</title>
    <meta name="description" content="${description}">
    <meta name="date" content="${publishDateYMD}">
    <meta name="author" content="PasswordMonkey">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://passwordmonkey.org/news/${filename}">
    <meta property="og:title" content="${item.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://passwordmonkey.org/images/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="PasswordMonkey">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="${publishDateISO}">
    <meta property="article:author" content="PasswordMonkey">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://passwordmonkey.org/news/${filename}">
    <meta name="twitter:title" content="${item.title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://passwordmonkey.org/images/og-image.png">

    <!-- Additional SEO Meta Tags -->
    <meta name="theme-color" content="#42b8ff">
    <meta name="msapplication-TileColor" content="#42b8ff">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="PasswordMonkey">
    <meta name="application-name" content="PasswordMonkey">
    <meta name="format-detection" content="telephone=no">

    <!-- Structured Data - NewsArticle Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "${item.title}",
        "description": "${description}",
        "datePublished": "${publishDateISO}",
        "dateModified": "${publishDateISO}",
        "author": {
            "@type": "Organization",
            "name": "PasswordMonkey",
            "url": "https://passwordmonkey.org/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "PasswordMonkey",
            "url": "https://passwordmonkey.org/",
            "logo": {
                "@type": "ImageObject",
                "url": "https://passwordmonkey.org/images/site_logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://passwordmonkey.org/news/${filename}"
        },
        "image": {
            "@type": "ImageObject",
            "url": "https://passwordmonkey.org/images/og-image.png",
            "width": 1200,
            "height": 630
        },
        "articleSection": "Password Security",
        "keywords": "password security, cybersecurity, data breach, password safety, digital security"
    }
    </script>

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Maax VIA', 'IBM Plex Sans', 'Inter', 'Open Sans', 'sans-serif'],
                        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
                    },
                    colors: {
                        canvas: '#181817',
                        raised: '#202020',
                        card: '#242424',
                        brand: {
                            DEFAULT: '#42b8ff',
                            50: '#f0f9ff',
                            100: '#e0f2fe',
                            200: '#bae6fd',
                            300: '#7dd3fc',
                            400: '#38bdf8',
                            500: '#42b8ff',
                            600: '#0284c7',
                            700: '#0369a1',
                            800: '#075985',
                            900: '#0c4a6e',
                        },
                        'blue-600': '#2563eb',
                        'blue-700': '#1d4ed8',
                        'gray-50': '#f9fafb',
                        'gray-200': '#e5e7eb',
                        'gray-300': '#d1d5db',
                        'gray-400': '#9ca3af',
                        'gray-500': '#6b7280',
                        'gray-600': '#4b5563',
                        'gray-700': '#374151',
                        'gray-800': '#1f2937',
                        'gray-900': 'rgb(17 24 39)',
                    }
                }
            }
        }
    </script>

<!--@include partials/theme-init.html -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9540362101494663"
     crossorigin="anonymous"></script>
<!--@include partials/head-assets.html prefix=../ -->
</head>
<body class="bg-gray-50 dark:bg-canvas min-h-screen font-sans">
<!--@include partials/sidebar.html active=news -->

<!-- RIGHT COLUMN -->
<div class="content-wrapper">
  <!-- M3 Top App Bar (subpage variant: no quick-copy button) -->
<!--@include partials/topbar.html prefix=../ -->

    <main class="container mx-auto px-4 py-8 bg-gray-50 dark:bg-canvas">
        <div class="max-w-4xl mx-auto">
            <!-- Breadcrumb Navigation -->
            <nav class="mb-6 text-sm text-gray-600 dark:text-gray-400">
                <a href="../" class="hover:text-blue-600 dark:hover:text-blue-400">Home</a>
                <span class="mx-2">→</span>
                <a href="/news/" class="hover:text-blue-600 dark:hover:text-blue-400">News</a>
                <span class="mx-2">→</span>
                <span class="text-gray-800 dark:text-gray-200">${item.title}</span>
            </nav>

            <!-- Article Content -->
            <article class="bg-white rounded-xl shadow-lg p-8 dark:bg-card">
                <!-- Article Header -->
                <header class="mb-8 pb-6 border-b border-gray-200 dark:border-[#333333]">
                    <h1 class="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">${item.title}</h1>
                    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div class="flex items-center">
                            <i class="fas fa-calendar-alt mr-2"></i>
                            <time datetime="${publishDateYMD}">${publishDateHuman}</time>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-user mr-2"></i>
                            <span>PasswordMonkey</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-clock mr-2"></i>
                            <span>${readingTime} min read</span>
                        </div>
                    </div>
                </header>

                <!-- Article Body -->
                <div class="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                    ${bodyHtml}
                </div>

                <!-- Article Footer -->
                <footer class="mt-8 pt-6 border-t border-gray-200 dark:border-[#333333]">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center space-x-4">
                            <span class="text-sm text-gray-600 dark:text-gray-400">Share:</span>
                            <a href="#" class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition" aria-label="Share on Twitter">
                                <i class="fab fa-twitter text-xl"></i>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition" aria-label="Share on Facebook">
                                <i class="fab fa-facebook text-xl"></i>
                            </a>
                            <a href="#" class="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition" aria-label="Share on LinkedIn">
                                <i class="fab fa-linkedin text-xl"></i>
                            </a>
                        </div>

                        <!-- Source/Reference if applicable -->
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                            Source: <a href="${proxiedLink}" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">${item.source}</a>
                        </div>
                    </div>
                </footer>
            </article>

            <!-- Related Articles Section -->
            <section class="mt-12">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Related Articles</h2>
                <div class="grid md:grid-cols-2 gap-6">
                </div>
            </section>

            <!-- Back to News Button -->
            <div class="mt-8 text-center">
                <a href="/news/" class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Back to News
                </a>
            </div>
        </div>
    </main>

<!--@include partials/footer.html prefix=../ -->
</div>
<script src="../script.js" defer></script>
</body>
</html>
`;

  const base64Content = Buffer.from(html).toString("base64");

  return {
    ...item,
    filename,
    html,
    base64Content
  };
}

import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
// Main flow (port of the n8n nodes after "Generate HTML1"):
// fetch all feeds -> normalize -> keyword filter -> reading time + date format
// -> build article HTML -> duplicate check vs news/ tree -> dry-run report
// OR write files + single batched commit + push via checkout-persisted credentials

async function main() {
  const allItems = [];
  const feedCounts = [];
  const feedErrors = [];
  let failedFeeds = 0;

  for (const feedUrl of FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = feed && feed.items ? feed.items : [];
      allItems.push(...items);
      feedCounts.push({ url: feedUrl, count: items.length });
      console.log(`feed OK ${items.length} items: ${feedUrl}`);
    } catch (err) {
      failedFeeds++;
      const message = err && err.message ? err.message : String(err);
      feedErrors.push({ url: feedUrl, error: message });
      console.log(`feed FAILED ${feedUrl}: ${message}`);
    }
  }

  if (failedFeeds === FEEDS.length) {
    console.error(`ERROR: all ${FEEDS.length} feeds failed; nothing to process.`);
    process.exit(1);
  }

  const normalized = allItems.map(normalizeItem);
  const matched = normalized.filter(keywordMatches);

  const wouldCreate = [];
  const skipped = [];

  for (const item of matched) {
    // n8n "Calculate Reading Time" node (200 wpm) - verbatim
    item.readingTime = Math.ceil((item.content ? item.content.split(/\s+/).length : 0) / 200);
    // n8n "Format Article Date" node - verbatim
    item.dateISO = new Date(item.publishedAt).toISOString().split("T")[0];
    item.dateFormatted = new Date(item.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const built = buildArticleHtml(item);

    if (existsSync(path.join(repoRoot, "news", built.filename))) {
      console.log(`skipped (exists): ${built.filename}`);
      skipped.push(built.filename);
    } else {
      wouldCreate.push({ filename: built.filename, html: built.html });
    }
  }

  if (dryRun) {
    console.log("");
    console.log("=== DRY RUN SUMMARY ===");
    console.log(`feeds OK: ${feedCounts.length}/${FEEDS.length}, FAILED: ${failedFeeds}`);
    feedCounts.forEach((fc) => console.log(`  feed OK ${fc.count} items: ${fc.url}`));
    feedErrors.forEach((fe) => console.log(`  feed FAILED ${fe.url}: ${fe.error}`));
    console.log(`total items fetched: ${allItems.length}`);
    console.log(`total matched by keywords: ${matched.length}`);
    console.log(`would create (${wouldCreate.length}):`);
    wouldCreate.forEach((f) => console.log(`  + ${f.filename}`));
    console.log(`skipped existing (${skipped.length}):`);
    skipped.forEach((s) => console.log(`  = ${s}`));
    process.exit(0);
  }

  for (const f of wouldCreate) {
    await fs.writeFile(path.join(repoRoot, "news", f.filename), f.html, "utf8");
    console.log(`wrote: ${f.filename}`);
  }

  if (wouldCreate.length === 0) {
    console.log("No new articles to commit.");
    return;
  }

  const relativePaths = wouldCreate.map((f) => `news/${f.filename}`).join(" ");
  execSync(`git add ${relativePaths}`);
  const commitMessage = `chore(news): add ${wouldCreate.length} article(s) via RSS pipeline`;
  execSync(
    `git -c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" commit -m "${commitMessage}"`
  );
  // Detached-HEAD-safe push (schedule/dispatch on a tag leaves HEAD detached)
  const targetRef = process.env.GITHUB_REF_NAME || "main";
  execSync(`git push origin HEAD:${targetRef}`);
  console.log(`committed and pushed ${wouldCreate.length} article(s) to ${targetRef}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("pipeline error:", err);
      process.exit(1);
    });
}