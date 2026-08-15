# Deploying members.mementomori.social

The app runs on [Cloudflare Workers](https://developers.cloudflare.com/workers/) with a [D1](https://developers.cloudflare.com/d1/) database. No credentials live in this repository.

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
   pnpm exec wrangler secret put MAILGUN_API_KEY
   pnpm exec wrangler secret put STRIPE_SECRET_KEY
   pnpm exec wrangler secret put STRIPE_WEBHOOK_SECRET
   pnpm exec wrangler secret put STRIPE_PRICE_MEMBER_YEAR
   pnpm exec wrangler secret put STRIPE_PRICE_MEMBER_MONTH
   pnpm exec wrangler secret put STRIPE_PRICE_SUPPORTING_YEAR
   pnpm exec wrangler secret put STRIPE_PRICE_SUPPORTING_MONTH
   pnpm exec wrangler secret put BANK_IBAN
   pnpm exec wrangler secret put CRON_SECRET
   pnpm exec wrangler secret put MATRIX_BASE_URL
   pnpm exec wrangler secret put MATRIX_ACCESS_TOKEN
   pnpm exec wrangler secret put MATRIX_ROOM_ID
   ```

   The `MATRIX_*` values are the signup-report-monitor bot's credentials on the Matrix host; with them set, new membership applications are announced in the admins room.

   Holvi bank import stays off until `HOLVI_API_BASE`, `HOLVI_API_KEY` and `HOLVI_POOL_HANDLE` are set. Until then the board records bank transfers by hand in the admin view.

   `ORIGIN` is plain config, set it as a var: `wrangler.jsonc` → `"vars": { "ORIGIN": "https://members.mementomori.social" }`.

4. The custom domain is declared in `wrangler.jsonc` (`routes`), and Cloudflare attaches it on first deploy. Remove the old DNS record pointing at the static site first.

## Deploy

```sh
pnpm run build
pnpm exec wrangler deploy
```

## After the first deploy

- Add the webhook endpoint `https://members.mementomori.social/webhooks/stripe` in the [Stripe dashboard](https://dashboard.stripe.com) and listen for `checkout.session.completed` and `invoice.paid`. Put the signing secret it gives you into `STRIPE_WEBHOOK_SECRET`.
- Schedule the daily job from any machine with cron:

  ```sh
  curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://members.mementomori.social/internal/cron
  ```

- Set up the backup layers before the first real member joins: see [docs/DATABASE.md](docs/DATABASE.md) for Time Travel and the nightly export cron.

## Notes

- The Mastodon OAuth app on mementomori.social already includes both the localhost and production redirect URIs.
- After a schema change: `pnpm exec drizzle-kit generate`, commit the SQL in `drizzle/`, then `wrangler d1 migrations apply DB --remote`.
