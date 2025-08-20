# PasswordMonkey – Automated News via n8n

This workflow fetches cybersecurity/password-related news from multiple RSS feeds, filters by keywords, transforms items to SEO-friendly HTML using `news/article-template.html`, and commits articles to `/news/`. Existing repo automations then update the manifest, sitemap, and RSS.

## Import
- Import `automation/n8n/passwordmonkey-news-workflow.json` into n8n (Cloud or self-hosted).

## Credentials
- GitHub API: token with `repo` scope.
- OpenAI (optional): required only if `USE_SUMMARY=true`.

## Environment variables (in n8n)
- `GITHUB_OWNER`: your GitHub org/user
- `GITHUB_REPO`: `passwordmonkey`
- `GITHUB_BRANCH`: `main` (default)
- `NEWS_KEYWORDS`: `password,breach,authentication,cybersecurity` (default)
- `USE_SUMMARY`: `false` or `true`
- `REPO_BASE_PATH` (optional): local path to repository for optional local file writes

## Flow (high level)
1. Trigger every 6h (Cron) or manual.
2. Read RSS from TheHackerNews, SecurityWeek, BleepingComputer.
3. Filter by keywords.
4. Transform and generate unique filename `YYYY-MM-DD-title-hash.html`.
5. Optional summary via OpenAI.
6. Fetch and fill `news/article-template.html`.
7. Skip if file already exists in GitHub; otherwise commit to `/news/`.

## Notes
- Duplicate avoidance: checks if `news/<filename>.html` already exists via GitHub API.
- Errors and metrics are visible in n8n execution logs.
- Output HTML matches the site's template so existing scripts can update `news-manifest.json`, `sitemap.xml`, and `rss.xml`.
