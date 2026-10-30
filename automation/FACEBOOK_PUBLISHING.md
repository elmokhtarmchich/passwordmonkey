# Facebook news publishing

PasswordMonkey can publish newly discovered news articles to the managed Facebook Page through the Meta Pages API.

The News Pipeline creates `automation/facebook-queue.json` only for article files created during a new pipeline run. Facebook consumes that queue, never the historical news manifest, so existing articles are not retroactively published.

## Required repository secrets

- `FACEBOOK_PAGE_ID`: `1392578940603197`
- `FACEBOOK_PAGE_ACCESS_TOKEN`: a Page access token with the required Pages publishing permissions

Never commit the token or put it in workflow output.

## Workflow behavior

- A successful `News Pipeline` run on `main` triggers the publisher.
- Exactly one queued article is considered per run.
- The queue entry and source HTML are validated before the API call.
- Invalid entries are marked `rejected` with reasons; they are not repeatedly retried.
- Successful entries are marked `published` and recorded in `facebook-published.json`.
- Automatic runs publish live; manual runs default to `dry_run=true`.

## Token health monitoring

The **Facebook Token Health Check** workflow runs every Monday at 09:00 UTC and can also be started manually. It makes a read-only request for the configured Page ID, so it does not publish or modify Facebook content. A failed run means the Page token is missing, expired, revoked, or no longer authorized for the configured Page and should be replaced before the next publishing run.

## Manual test

Run **Facebook News Publisher** manually with `dry_run=true` and `post_limit=1` to preview the next queued article. The limit is always enforced at one article per run.

The publisher rejects missing or future dates, stale queue entries, unsafe filenames, missing article files, mismatched canonical URLs, placeholder content, and invalid title or description lengths. It normalizes only the Facebook message text; it never rewrites article content or facts.
