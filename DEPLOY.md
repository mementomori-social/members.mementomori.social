# Deploying members.mementomori.social

The app runs on Cloudflare Workers with a D1 database. No credentials live in
this repository.

## One-time setup

1. Create the database and put the real id into `wrangler.jsonc`:

   ```sh
   pnpm exec wrangler d1 create mementomori-members
   ```

2. Apply migrations to the remote database:

   ```sh
   pnpm exec wrangler d1 migrations apply DB --remote
   ```

3. Set the production secrets:

   ```sh
   pnpm exec wrangler secret put BETTER_AUTH_SECRET
   pnpm exec wrangler secret put MASTODON_CLIENT_ID
   pnpm exec wrangler secret put MASTODON_CLIENT_SECRET
   pnpm exec wrangler secret put BOOTSTRAP_ROLES
   ```

   `ORIGIN` is plain config, set it as a var:
   `wrangler.jsonc` → `"vars": { "ORIGIN": "https://members.mementomori.social" }`.

4. The custom domain is declared in `wrangler.jsonc` (`routes`); Cloudflare
   attaches it on first deploy. Remove the old DNS record pointing at the
   static site first.

## Deploy

```sh
pnpm run build
pnpm exec wrangler deploy
```

## Notes

- The Mastodon OAuth app on mementomori.social already includes both the
  localhost and production redirect URIs.
- After a schema change: `pnpm exec drizzle-kit generate`, commit the SQL in
  `drizzle/`, then `wrangler d1 migrations apply DB --remote`.
