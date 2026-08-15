# members.mementomori.social

Membership site of **Mementomori ry**, the registered non-profit that runs and funds the [mementomori.social](https://mementomori.social) social media platform.

Members apply on the site, the board approves applications, and membership fees are tracked in a payment ledger. The member register required by the Finnish Associations Act (full name and home municipality) is maintained here and exportable as CSV.

<img width="1267" height="1024" alt="members mementomori social_" src="https://github.com/user-attachments/assets/6480601a-4a7d-42ec-b3e9-0fcf56a58d71" />

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) on [Cloudflare Workers](https://developers.cloudflare.com/workers/), via [@sveltejs/adapter-cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) with [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://better-auth.com) with magic links and [Mastodon](https://joinmastodon.org) OAuth, no passwords
- [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for i18n, English and Finnish
- [Stripe](https://stripe.com) Checkout for card payments, Finnish reference numbers (viitenumero) for bank transfers

How it all fits together, including an infrastructure diagram and the reasoning behind these choices: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development

```sh
pnpm install
cp .env.example .env       # fill in the values
pnpm exec drizzle-kit generate            # only after schema changes
pnpm exec wrangler d1 migrations apply DB --local
pnpm dev
```

The local D1 database lives under `.wrangler/` and is built from the SQL migrations in `drizzle/`. No Cloudflare account is needed for local development.

Board roles are bootstrapped from `BOOTSTRAP_ROLES` in `.env` (`email=chair,email=vice,email=board`), applied when that email signs up.

Without `MAILGUN_API_KEY` set, emails are printed to the dev server console instead of being sent, so magic links work offline.

## Checks

```sh
pnpm run check   # wrangler types + svelte-check
pnpm run lint
pnpm run build
```

## Deploying

See [DEPLOY.md](DEPLOY.md).
