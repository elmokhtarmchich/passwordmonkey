// Publish newly discovered PasswordMonkey articles to the managed Facebook Page.
// Node 20 ESM. Safe by default: use --dry-run to preview without publishing.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..", "..");
const manifestPath = path.join(repoRoot, "news", "news-manifest.json");
const statePath = path.join(repoRoot, "automation", "facebook-published.json");
const pageId = process.env.FACEBOOK_PAGE_ID || "";
const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
const apiVersion = process.env.FACEBOOK_API_VERSION || "v26.0";
const lookbackHours = Number(process.env.FACEBOOK_LOOKBACK_HOURS || "24");
const limit = Math.max(1, Number(process.env.FACEBOOK_POST_LIMIT || "3"));
const dryRun = process.argv.includes("--dry-run") || process.env.FACEBOOK_DRY_RUN !== "false";

function articleUrl(article) {
  const file = article.file || `${article.slug}.html`;
  return `https://passwordmonkey.org/news/${file.replace(/\.html$/i, "")}`;
}

function articleMessage(article) {
  const title = String(article.title || "PasswordMonkey news").replace(/\s*\|\s*Password Monkey\s*$/i, "");
  const description = String(article.description || "").replace(/\s+/g, " ").trim();
  const summary = description.length > 280 ? `${description.slice(0, 277).trimEnd()}...` : description;
  return summary ? `🛡️ ${title}\n\n${summary}` : `🛡️ ${title}`;
}

function cutoffTime() {
  return Date.now() - lookbackHours * 60 * 60 * 1000;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function publish(article) {
  const endpoint = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(pageId)}/feed`;
  const body = new URLSearchParams({
    message: articleMessage(article),
    link: articleUrl(article),
    access_token: pageAccessToken
  });
  const response = await fetch(endpoint, { method: "POST", body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const detail = payload.error?.message || `HTTP ${response.status}`;
    throw new Error(`Facebook publish failed for ${article.file}: ${detail}`);
  }
  return payload.id || payload.post_id || "unknown";
}

async function main() {
  const manifest = await readJson(manifestPath, { articles: [] });
  const state = await readJson(statePath, { version: 1, articles: {} });
  const articles = Array.isArray(manifest.articles) ? manifest.articles : [];
  const candidates = articles
    .filter((article) => article?.file && !state.articles[article.file])
    .filter((article) => {
      const updated = Date.parse(article.updated || article.published || "");
      return Number.isNaN(updated) || updated >= cutoffTime();
    })
    .sort((a, b) => String(a.updated || a.published || "").localeCompare(String(b.updated || b.published || "")))
    .slice(0, limit);

  console.log(`Facebook candidates: ${candidates.length} (lookback ${lookbackHours}h, limit ${limit})`);
  for (const article of candidates) {
    console.log(`  ${dryRun ? "would publish" : "publishing"}: ${article.file} -> ${articleUrl(article)}`);
  }

  if (dryRun || candidates.length === 0) return;
  if (!pageId || !pageAccessToken) {
    throw new Error("FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN are required when live publishing is enabled.");
  }

  for (const article of candidates) {
    const postId = await publish(article);
    state.articles[article.file] = {
      postId,
      url: articleUrl(article),
      publishedAt: new Date().toISOString()
    };
    console.log(`published: ${article.file} (Facebook post ${postId})`);
  }
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(`facebook publisher error: ${error.message}`);
  process.exit(1);
});
