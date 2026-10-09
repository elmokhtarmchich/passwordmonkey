import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createSign } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOST = "passwordmonkey.org";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const REDIRECTS_FILE = path.join(REPO, "_redirects");
const MANIFEST_FILE = path.join(REPO, "news", "news-manifest.json");
const SEEN_FILE = path.join(REPO, "automation", "url-hygiene.seen.json");
const LIST_FILE = path.join(REPO, "automation", "url-hygiene.list.txt");
const GSC_WINDOW_DAYS = Number(process.env.GSC_WINDOW_DAYS || 14);
const REDIRECTS_SOFT_LIMIT = 1900;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FIXTURES = args.includes("--fixtures");
const LIST_ONLY = args.includes("--list");

const FIXTURE_URLS = [
  "https://passwordmonkey.org/news/2026-10-08-sonicwall-%E2%80%A6-b55507.html",
  "https://passwordmonkey.org/news/2026-10-08-sonicwall-x-b55507.html",
  "https://passwordmonkey.org/news/2026-10-08-sonicwall-%E2%80%A6-b55507",
  "https://passwordmonkey.org/news/xyz-not-a-real-article",
  "https://passwordmonkey.org/pasword-genrator",
  "https://passwordmonkey.org/news/2026-10-08-sonicwall-and-splunk-patch-critical-vulnerabilitie-b55507",
  "https://passwordmonkey.org/news/2026-10-08-sonicwall-and-splunk-patch-critical-vulnerabilitie-b55507.html",
  "https://passwordmonkey.org/",
  "https://passwordmonkey.org/style.css",
  "https://passwordmonkey.org/faq"
];

function findIndexNowKey() {
  for (const name of readdirSync(REPO)) {
    const m = name.match(/^([0-9a-f]{32})\.txt$/i);
    if (!m) continue;
    const content = readFileSync(path.join(REPO, name), "utf8").trim();
    if (content.toLowerCase() === m[1].toLowerCase()) return m[1].toLowerCase();
  }
  throw new Error("IndexNow key file not found in repo root (expected <32-hex>.txt containing the key)");
}

function loadManifest() {
  if (!existsSync(MANIFEST_FILE)) return [];
  try {
    const data = JSON.parse(readFileSync(MANIFEST_FILE, "utf8"));
    return Array.isArray(data.articles) ? data.articles : [];
  } catch (err) {
    console.error("WARN: could not parse news-manifest.json: " + err.message);
    return [];
  }
}

function readRedirects() {
  const text = existsSync(REDIRECTS_FILE) ? readFileSync(REDIRECTS_FILE, "utf8") : "";
  const sources = new Set();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const source = line.split(/\s+/)[0];
    if (source) sources.add(source);
  }
  return { text, sources };
}

function readSeen() {
  if (!existsSync(SEEN_FILE)) return {};
  try {
    return JSON.parse(readFileSync(SEEN_FILE, "utf8"));
  } catch {
    return {};
  }
}

function readList() {
  if (!existsSync(LIST_FILE)) return [];
  return readFileSync(LIST_FILE, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

const ASSET_RE = /\.(css|js|mjs|json|xml|txt|png|jpe?g|gif|svg|webp|avif|ico|otf|ttf|woff2?|map|webmanifest)$/i;

function decodePath(p) {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
}

function realFileExists(rawPathname) {
  const p = decodePath(rawPathname);
  if (!p.startsWith("/") || p.includes("..")) return false;
  const rel = p.slice(1);
  if (!rel) return false;
  if (existsSync(path.join(REPO, rel))) return true;
  if (!/\.[a-z0-9]+$/i.test(rel) && existsSync(path.join(REPO, rel + ".html"))) return true;
  return false;
}

function hashToken(rawPathname) {
  const cleaned = rawPathname.replace(/\/+$/, "");
  const m = cleaned.match(/-([0-9a-f]{6})(?:\.html?)?$/i);
  return m ? m[1].toLowerCase() : null;
}

function manifestHit(articles, token) {
  if (!token) return null;
  const suffix = "-" + token + ".html";
  const hits = articles.filter((a) => (a.file || "").toLowerCase().endsWith(suffix));
  if (hits.length > 1) {
    console.error("WARN: hash " + token + " matches " + hits.length + " articles, using the first");
  }
  return hits[0] || null;
}

function classify(urlString, articles, redirectSources) {
  let u;
  try {
    u = new URL(urlString);
  } catch {
    return { action: "ignore", reason: "malformed-url", urlString };
  }
  const rawPath = u.pathname;
  if (rawPath === "/") return { action: "ignore", reason: "home", urlString, rawPath };
  if (ASSET_RE.test(rawPath)) return { action: "ignore", reason: "asset", urlString, rawPath };
  if (realFileExists(rawPath)) return { action: "ignore", reason: "real-file", urlString, rawPath };
  if (redirectSources.has(rawPath)) return { action: "already-redirected", urlString, rawPath };
  const token = hashToken(rawPath);
  const hit = manifestHit(articles, token);
  if (hit) {
    return { action: "redirect", urlString, rawPath, dest: "/news/" + hit.file, title: hit.title || "" };
  }
  return { action: "ping-only", reason: "unrecoverable-404", urlString, rawPath };
}

function b64url(str) {
  return Buffer.from(str, "utf8").toString("base64url");
}

async function gscAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: sa.token_uri,
    exp: now + 3600,
    iat: now - 60
  };
  const signingInput = b64url(JSON.stringify(header)) + "." + b64url(JSON.stringify(claims));
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = signer.sign(sa.private_key).toString("base64url");
  const assertion = signingInput + "." + signature;
  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  const body = await res.text();
  if (!res.ok) throw new Error("GSC token exchange failed " + res.status + ": " + body.slice(0, 300));
  return JSON.parse(body).access_token;
}

async function gscRequest(token, url, init) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
      ...(init && init.headers)
    }
  });
  const body = await res.text();
  if (!res.ok) throw new Error("GSC API " + res.status + " " + url + ": " + body.slice(0, 300));
  return body ? JSON.parse(body) : {};
}

async function gscDetectPages(sa) {
  const token = await gscAccessToken(sa);
  let siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    const sites = await gscRequest(token, "https://searchconsole.googleapis.com/webmasters/v3/sites", {});
    const matches = (sites.siteEntry || []).filter((s) => (s.siteUrl || "").includes(HOST));
    const preferred = matches.find((s) => s.siteUrl.startsWith("sc-domain:")) || matches[0];
    if (!preferred) throw new Error("No Search Console property containing " + HOST + " is accessible to this service account - grant the service account access in GSC");
    siteUrl = preferred.siteUrl;
  }
  const iso = (d) => d.toISOString().slice(0, 10);
  const end = new Date(Date.now() - 86400000);
  const start = new Date(Date.now() - 86400000 * (GSC_WINDOW_DAYS + 1));
  const data = await gscRequest(
    token,
    "https://searchconsole.googleapis.com/webmasters/v3/sites/" + encodeURIComponent(siteUrl) + "/searchAnalytics/query",
    {
      method: "POST",
      body: JSON.stringify({
        startDate: iso(start),
        endDate: iso(end),
        dimensions: ["page"],
        rowLimit: 25000,
        dataState: "final"
      })
    }
  );
  const rows = data.rows || [];
  console.log("GSC: property " + siteUrl + " returned " + rows.length + " page rows (" + iso(start) + " .. " + iso(end) + ")");
  const pages = {};
  for (const r of rows) {
    const url = (r.keys && r.keys[0]) || "";
    if (!url.startsWith("http")) continue;
    pages[url] = { impressions: r.impressions || 0, clicks: r.clicks || 0 };
  }
  return Object.keys(pages);
}

async function pingIndexNow(key, urls) {
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: "https://" + HOST + "/" + key + ".txt",
      urlList: urls
    })
  });
  const body = await res.text();
  return { status: res.status, body: body.slice(0, 300) };
}

async function main() {
  const key = findIndexNowKey();
  const articles = loadManifest();
  const redirects = readRedirects();
  const seen = readSeen();
  let candidates = [];

  if (FIXTURES) {
    candidates = FIXTURE_URLS.slice();
    console.log("Mode: fixtures (no GSC, no writes, no pings" + (DRY_RUN ? ", dry-run" : "") + ")");
  } else {
    candidates = readList();
    if (LIST_ONLY || !process.env.GSC_SA_JSON) {
      if (!process.env.GSC_SA_JSON && !LIST_ONLY) {
        console.log("GSC_SA_JSON secret not set - Search Console detection SKIPPED (manual-list-only mode). Add the secret to enable auto-detection.");
      }
    } else {
      try {
        const sa = JSON.parse(process.env.GSC_SA_JSON);
        const gscPages = await gscDetectPages(sa);
        candidates = candidates.concat(gscPages);
      } catch (err) {
        console.error("GSC detection failed (secret is set, so failing loudly): " + err.message);
        process.exit(1);
      }
    }
  }

  candidates = [...new Set(candidates)];
  console.log("Candidates: " + candidates.length);

  const pings = [];
  const newRedirects = [];
  const seenUpdates = {};
  const report = [];

  for (const url of candidates) {
    if (seen[url]) {
      report.push("[skip-seen]   " + url + "  (last action: " + (seen[url].action || "?") + ")");
      continue;
    }
    const c = classify(url, articles, redirects.sources);
    switch (c.action) {
      case "ignore":
        report.push("[ignore]      " + url + "  (" + c.reason + ")");
        break;
      case "already-redirected":
        report.push("[redirect-ok] " + url + "  (301 already in _redirects)");
        pings.push(url);
        seenUpdates[url] = { action: "already-redirected" };
        break;
      case "redirect":
        report.push("[redirect+]   " + url + "  ->  " + c.dest + (c.title ? "  \"" + c.title.slice(0, 60) + "\"" : ""));
        newRedirects.push({ source: c.rawPath, dest: c.dest });
        redirects.sources.add(c.rawPath);
        pings.push(url);
        seenUpdates[url] = { action: "redirected" };
        break;
      default:
        report.push("[ping-only]   " + url + "  (unrecoverable 404 - ping so crawlers drop it)");
        pings.push(url);
        seenUpdates[url] = { action: "pinged-404" };
        break;
    }
  }

  for (const line of report) console.log(line);

  console.log("");
  console.log("New _redirects lines: " + newRedirects.length);
  for (const r of newRedirects) console.log("  " + r.source + " " + r.dest + " 301");
  console.log("IndexNow pings: " + pings.length);
  for (const u of pings) console.log("  " + u);

  if (DRY_RUN || FIXTURES) {
    console.log("");
    console.log(DRY_RUN ? "Dry-run: no files written, no pings sent." : "Fixtures mode: no files written, no pings sent.");
    return;
  }

  if (redirects.sources.size + newRedirects.length > REDIRECTS_SOFT_LIMIT) {
    console.error("WARN: _redirects approaching the 2000-line static limit (" + (redirects.sources.size + newRedirects.length) + " sources)");
  }

  let pingOk = true;
  if (pings.length) {
    try {
      const result = await pingIndexNow(key, pings);
      console.log("IndexNow response: HTTP " + result.status + " " + result.body);
      pingOk = result.status === 200 || result.status === 202;
    } catch (err) {
      console.error("IndexNow ping failed: " + err.message);
      pingOk = false;
    }
  }

  const nowISO = new Date().toISOString();
  if (newRedirects.length) {
    let text = redirects.text;
    if (text && !text.endsWith("\n")) text += "\n";
    text += newRedirects.map((r) => r.source + " " + r.dest + " 301").join("\n") + "\n";
    writeFileSync(REDIRECTS_FILE, text, "utf8");
    console.log("Appended " + newRedirects.length + " redirect line(s) to _redirects");
  }

  if (pingOk && Object.keys(seenUpdates).length) {
    for (const [url, meta] of Object.entries(seenUpdates)) {
      const prev = seen[url] || {};
      seen[url] = { ...meta, first: prev.first || nowISO, last: nowISO };
    }
    writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2) + "\n", "utf8");
    console.log("Recorded " + Object.keys(seenUpdates).length + " URL(s) in the seen list");
  } else if (Object.keys(seenUpdates).length) {
    console.log("Seen list NOT updated (ping failed) - URLs will be retried on the next run");
  }

  if (!newRedirects.length && !Object.keys(seenUpdates).length && !pings.length) {
    console.log("Nothing to do - no bad URLs, no pings pending.");
  }
}

main().catch((err) => {
  console.error("FATAL: " + (err && err.stack ? err.stack : err));
  process.exit(1);
});
