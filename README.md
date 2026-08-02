# members.mementomori.social

Membership site of **Mementomori ry**, the registered non-profit that runs and
funds the [mementomori.social](https://mementomori.social) social media
platform.

Members apply on the site, the board approves applications, and membership
fees are tracked in a payment ledger. The member register required by the
Finnish Associations Act (full name and home municipality) is maintained here
and exportable as CSV.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) on
  [Cloudflare Workers](https://developers.cloudflare.com/workers/)
  (`@sveltejs/adapter-cloudflare`)
- [Cloudflare D1](https://developers.cloudflare.com/d1/) with
  [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://better-auth.com) with email + password and
  mementomori.social (Mastodon) OAuth for account linking and sign-in

## Development

```sh
pnpm install
cp .env.example .env       # fill in the values
pnpm exec drizzle-kit generate            # only after schema changes
pnpm exec wrangler d1 migrations apply DB --local
pnpm dev
```

The local D1 database lives under `.wrangler/` and is applied from the SQL
migrations in `drizzle/`. No Cloudflare account is needed for local
development.

Board roles are bootstrapped from `BOOTSTRAP_ROLES` in `.env`
(`email=chair,email=vice,email=board`), applied when that email signs up.

## Checks

```sh
pnpm run check   # wrangler types + svelte-check (tsgo)
pnpm run lint
pnpm run build
```

## Deploying

See [DEPLOY.md](DEPLOY.md).
