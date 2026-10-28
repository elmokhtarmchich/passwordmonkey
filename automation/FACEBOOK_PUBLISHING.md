# Facebook news publishing

PasswordMonkey can publish newly discovered news articles to the managed Facebook Page through the Meta Pages API.

## Required repository secrets

- `FACEBOOK_PAGE_ID`: `1392578940603197`
- `FACEBOOK_PAGE_ACCESS_TOKEN`: a Page access token with the required Pages publishing permissions

Never commit the token or put it in workflow output.

## Safe rollout

1. Run **Facebook News Publisher** manually with `dry_run=true` and `post_limit=1`.
2. Confirm the candidate articles and message format in the Actions log.
3. Test live publishing with one article by setting `dry_run=false` and `post_limit=1` in a manual workflow run.
4. Only then change the automatic workflow-run path from dry-run to live publishing.

The publisher only considers articles updated within the last 24 hours, limits each run to three posts, and records successful article files and Facebook post IDs in `facebook-published.json` to prevent duplicates.
