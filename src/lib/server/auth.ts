import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth, magicLink } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '$lib/server/db';
import { rateLimitStorage } from '$lib/server/rate-limit';
import { sendEmail } from '$lib/server/email';

const MASTODON_URL = 'https://mementomori.social';

const authConfig = {
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	// Passwords exist only internally (random, set by the join flow). Requiring
	// a verified email blocks account pre-registration: nobody can claim an
	// address they cannot read and later sign in with their own password.
	emailAndPassword: { enabled: true, requireEmailVerification: true },
	user: {
		additionalFields: {
			// member = regular user, board roles: board | vice | chair
			role: { type: 'string', defaultValue: 'member', input: false }
		}
	},
	account: {
		accountLinking: { enabled: true }
	},
	// Workers have no NODE_ENV, so Better Auth would leave the limiter off and
	// let anyone flood magic links to arbitrary addresses. Storage is D1: each
	// request may hit a different isolate, so in-memory counters miss most of it.
	rateLimit: {
		enabled: true,
		window: 60,
		max: 60,
		customRules: {
			'/sign-in/magic-link': { window: 300, max: 3 },
			'/sign-in/email': { window: 300, max: 5 },
			'/sign-up/email': { window: 3600, max: 5 }
		}
	},
	plugins: [
		magicLink({
			sendMagicLink: async ({ email, url }) => {
				// Spam filters flag terse messages with one long link (Mailgun blocked
				// one at 4.6 points); a fuller bilingual body scores like real mail.
				await sendEmail(
					email,
					'Kirjautumislinkki jäsenportaaliin / Your sign-in link - Mementomori ry',
					[
						'Hei!',
						'',
						'Pyysit kirjautumislinkin Mementomori ry:n jäsenportaaliin. Pääset kirjautumaan avaamalla tämän linkin:',
						'',
						url,
						'',
						'Linkki on voimassa muutaman minuutin. Jos et pyytänyt tätä viestiä, voit jättää sen huomiotta, eikä sinun tarvitse tehdä mitään.',
						'',
						'---',
						'',
						'Hello!',
						'',
						'You requested a sign-in link to the Mementomori ry member portal. Open this link to sign in:',
						'',
						url,
						'',
						'The link is valid for a few minutes. If you did not request this message, you can safely ignore it.',
						'',
						'Terveisin / Best regards,',
						'Mementomori ry',
						'https://members.mementomori.social'
					].join('\n')
				);
			}
		}),
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
					// The synthetic address satisfies the plugin's email requirement for
					// the sign-in lookup; with implicit sign-up disabled it is never
					// stored as a real user email (.invalid cannot receive mail).
					disableImplicitSignUp: true,
					mapProfileToUser: (profile: { id?: string; acct?: string; display_name?: string }) => ({
						name: profile.display_name || profile.acct || 'Mastodon user',
						email: `masto-${profile.id ?? 'unknown'}@login.invalid`
					})
				}
			]
		}),
		sveltekitCookies(getRequestEvent) // must stay last
	]
} satisfies Omit<Parameters<typeof betterAuth>[0], 'database'>;

export const createAuth = (d1: D1Database) => {
	const db = getDb(d1);
	return betterAuth({
		...authConfig,
		rateLimit: { ...authConfig.rateLimit, customStorage: rateLimitStorage(db) },
		database: drizzleAdapter(db, { provider: 'sqlite' })
	});
};

/**
 * DO NOT USE!
 *
 * This instance is used by the `better-auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
