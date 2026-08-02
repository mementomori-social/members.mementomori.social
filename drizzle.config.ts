import { defineConfig } from 'drizzle-kit';

// Remote credentials are only needed for push/studio against the real D1
// (d1-http). Plain `generate` is offline, and local dev applies the generated
// SQL with `wrangler d1 migrations apply DB --local`.
const remote =
	process.env.CLOUDFLARE_ACCOUNT_ID &&
	process.env.CLOUDFLARE_DATABASE_ID &&
	process.env.CLOUDFLARE_D1_TOKEN;

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	...(remote
		? {
				driver: 'd1-http',
				dbCredentials: {
					accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
					databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
					token: process.env.CLOUDFLARE_D1_TOKEN!
				}
			}
		: {}),
	verbose: true,
	strict: true
});
