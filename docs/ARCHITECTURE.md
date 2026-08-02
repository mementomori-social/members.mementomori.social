# Architecture

Membership site of Mementomori ry. SvelteKit on Cloudflare Workers, D1
(SQLite) with Drizzle ORM, Better Auth for authentication, Paraglide for
i18n (English at the root, Finnish under `/fi`).

## Authentication

No passwords. Two ways in:

- **Mastodon OAuth** against mementomori.social (PKCE, `profile` scope).
  Mastodon does not expose email addresses, so OAuth verifies the account and
  prefills the name; the application form still collects name, home
  municipality and email. The verified account is linked at creation and used
  for subsequent sign-ins.
- **Magic links**: the form path stores the application without a login and
  emails a sign-in link (Better Auth magicLink plugin, Mailgun HTTP API). The
  application row is claimed by verified email on first dashboard visit.

## Membership flow

Application -> `member` row with status `applied` -> board approval (two
distinct board members, at least one chair or vice chair, self-approval
blocked) -> `approved`. Approvals are recorded in the `approval` table.

## Payments

All payments land in the `payment` ledger table:

- **Stripe Checkout** subscriptions with fixed prices from environment
  price ids. The webhook (`/webhooks/stripe`) verifies signatures and writes
  a ledger row per paid invoice, idempotent on the invoice id.
- **Bank transfers**: each approved member gets a unique Finnish reference
  number (viitenumero, 7-3-1 check digit). The daily job imports bank
  transactions when configured and matches them to members by reference;
  otherwise the board records transfers in the admin view.

## Automation

`POST /internal/cron` (bearer token) runs daily jobs: bank transaction
import, payment reminder emails to bank payers (subscribers renew
automatically), and an overdue summary to the board. Memberships are never
terminated automatically.

## Tables

Better Auth: `user`, `session`, `account`, `verification`. Domain: `member`
(the statutory member register), `approval`, `payment`. Migrations live in
`drizzle/` and are applied with `wrangler d1 migrations apply`.

## Security

CSP with per-request nonces, security headers in the server hook, external
images only through same-origin proxy routes with host allowlists, OAuth
state + PKCE cookies httpOnly. See `src/hooks.server.ts`.

## i18n

Messages in `messages/{en,fi}.json`, compiled by Paraglide. URL strategy:
English at the root, `/fi` prefix for Finnish, cookie fallback, browser
language detection for first visits. The language switcher is a native
select that scales to any number of locales.
