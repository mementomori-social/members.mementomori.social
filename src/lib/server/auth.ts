import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db';

const MASTODON_URL = 'https://mementomori.social';

const authConfig = {
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			// member = regular user, board roles: board | vice | chair
			role: { type: 'string', defaultValue: 'member', input: false }
		}
	},
	account: {
		accountLinking: { enabled: true }
	},
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'mastodon',
					clientId: env.MASTODON_CLIENT_ID ?? '',
					clientSecret: env.MASTODON_CLIENT_SECRET ?? '',
					authorizationUrl: `${MASTODON_URL}/oauth/authorize`,
					tokenUrl: `${MASTODON_URL}/oauth/token`,
					userInfoUrl: `${MASTODON_URL}/api/v1/accounts/verify_credentials`,
					scopes: ['profile'],
					pkce: true,
					// Mastodon never returns an email address, so a Mastodon account can
					// only be LINKED to an existing account (and used for sign-in after
					// that), never used to create one. The join form collects the email.
					mapProfileToUser: (profile: { acct?: string; display_name?: string }) => ({
						name: profile.display_name || profile.acct || 'Mastodon user'
					})
				}
			]
		}),
		sveltekitCookies(getRequestEvent) // must stay last
	]
} satisfies Omit<Parameters<typeof betterAuth>[0], 'database'>;

export const createAuth = (d1: D1Database) =>
	betterAuth({
		...authConfig,
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});

/**
 * DO NOT USE!
 *
 * This instance is used by the `better-auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
