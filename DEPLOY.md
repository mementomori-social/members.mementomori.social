# Deploying members.mementomori.social

Static site, no build step. Hosted on Cloudflare Pages, same as help.mementomori.social.

## Method A: Cloudflare Pages Git integration (recommended)

1. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git.
2. Pick the repo `mementomori-social/members.mementomori.social`.
3. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/`
4. Save and Deploy. The first build gives a `*.pages.dev` URL.
5. Custom domain: Pages project -> Custom domains -> `members.mementomori.social`.
   The zone is on Cloudflare, so the DNS record and SSL are created automatically.

## Method B: GitHub Actions + wrangler

Set repo secrets `CLOUDFLARE_API_TOKEN` (Account -> Cloudflare Pages -> Edit) and
`CLOUDFLARE_ACCOUNT_ID`, then push to `main`. The workflow runs
`wrangler pages deploy .` into the `members-mementomori-social` project.
