// Publish exactly one newly discovered, validated PasswordMonkey article to Facebook.
// Node 20 ESM. Safe by default: live publishing requires FACEBOOK_DRY_RUN=false.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..", "..");
const newsDir = path.join(repoRoot, "news");
const queuePath = path.join(repoRoot, "automation", "facebook-queue.json");
const statePath = path.join(repoRoot, "automation", "facebook-published.json");
const pageId = process.env.FACEBOOK_PAGE_ID || "";
const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "";
const apiVersion = process.env.FACEBOOK_API_VERSION || "v26.0";
const dryRun = process.argv.includes("--dry-run") || process.env.FACEBOOK_DRY_RUN !== "false";
const maxAgeHours = Number(process.env.FACEBOOK_MAX_QUEUE_AGE_HOURS || "168");

function articleUrl(file) {
  return `https://passwordmonkey.org/news/${file.replace(/\.html$/i, "")}`;
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
}

function articleMessage(entry, html) {
  const htmlTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const htmlDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1];
  const title = decodeEntities(entry.title || htmlTitle).replace(/\s*\|\s*Password Monkey\s*$/i, "");
  const description = decodeEntities(entry.description || htmlDescription);
  const summary = description.length > 280 ? `${description.slice(0, 277).trimEnd()}...` : description;
  return summary ? `🛡️ ${title}\n\n${summary}` : `🛡️ ${title}`;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function validDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  const today = new Date().toISOString().slice(0, 10);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value <= today;
}

async function validateEntry(file, entry) {
  const errors = [];
  const safeFile = path.basename(file) === file && /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.html$/i.test(file);
  if (!safeFile) errors.push("unsafe article filename");
  if (!validDateOnly(entry?.published)) errors.push("invalid or future published date");
  if (!entry?.discoveredAt || Number.isNaN(Date.parse(entry.discoveredAt))) errors.push("invalid discovery timestamp");
  if (entry?.discoveredAt && Date.now() - Date.parse(entry.discoveredAt) > maxAgeHours * 60 * 60 * 1000) {
    errors.push("queue entry is too old");
  }

  const articlePath = path.join(newsDir, file);
  const relative = path.relative(newsDir, articlePath);
  if (!safeFile || relative.startsWith("..") || path.isAbsolute(relative)) errors.push("article path escapes news directory");

  let html = "";
  try {
    html = await fs.readFile(articlePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") errors.push("article file is missing");
    else throw error;
  }

  if (html) {
    const expectedUrl = articleUrl(file);
    const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1];
    const title = decodeEntities(entry.title || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]).replace(/\s*\|\s*Password Monkey\s*$/i, "");
    const description = decodeEntities(entry.description || html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]);
    if (!ogUrl || ogUrl !== expectedUrl) errors.push("canonical Facebook URL does not match article");
    if (title.length < 10 || title.length > 180) errors.push("title length is invalid");
    if (description.length < 20 || description.length > 500) errors.push("description length is invalid");
    if (/related article title|brief description of the related article|passwordmonkey news/i.test(`${title} ${description}`)) {
      errors.push("placeholder content detected");
    }
  }
  return { errors, html };
}

async function publish(entry, html, file) {
  const endpoint = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(pageId)}/feed`;
  const body = new URLSearchParams({
    message: articleMessage(entry, html),
    link: articleUrl(file),
    access_token: pageAccessToken
  });
  const response = await fetch(endpoint, { method: "POST", body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const detail = payload.error?.message || `HTTP ${response.status}`;
    throw new Error(`Facebook publish failed for ${file}: ${detail}`);
  }
  return payload.id || payload.post_id || "unknown";
}

async function main() {
  const queue = await readJson(queuePath, { version: 1, articles: {} });
  const state = await readJson(statePath, { version: 1, articles: {} });
  const entries = queue?.articles && typeof queue.articles === "object" ? queue.articles : {};
  const candidates = Object.entries(entries)
    .filter(([file, entry]) => entry?.status === "pending" && !state.articles?.[file])
    .sort(([, a], [, b]) => String(a.discoveredAt).localeCompare(String(b.discoveredAt)))
    .slice(0, 1);

  console.log(`Facebook candidates: ${candidates.length} (new-article queue, limit 1)`);
  if (candidates.length === 0) return;

  const [file, entry] = candidates[0];
  const validation = await validateEntry(file, entry);
  if (validation.errors.length > 0) {
    console.error(`Facebook rejected: ${file} — ${validation.errors.join("; ")}`);
    if (!dryRun) {
      entries[file] = { ...entry, status: "rejected", rejectedAt: new Date().toISOString(), rejectionReasons: validation.errors };
      await fs.writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
    }
    if (!dryRun) process.exitCode = 1;
    return;
  }

  console.log(`  ${dryRun ? "would publish" : "publishing"}: ${file} -> ${articleUrl(file)}`);
  if (dryRun) return;
  if (!pageId || !pageAccessToken) throw new Error("FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN are required when live publishing is enabled.");

  const postId = await publish(entry, validation.html, file);
  const publishedAt = new Date().toISOString();
  state.articles[file] = { postId, url: articleUrl(file), publishedAt };
  entries[file] = { ...entry, status: "published", publishedAt, postId };
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await fs.writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  console.log(`published: ${file} (Facebook post ${postId})`);
}

main().catch((error) => {
  console.error(`facebook publisher error: ${error.message}`);
  process.exit(1);
});
