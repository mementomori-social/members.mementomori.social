import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/environment';
import { createAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getMemberByUserId } from '$lib/server/members';

/** Resolves the locale (URL prefix, then cookie) and stamps <html lang>. */
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (!event.platform?.env?.DB)
		throw new Error('D1 binding "DB" not found - are you running with wrangler?');

	event.locals.auth = createAuth(event.platform.env.DB);

	const { auth } = event.locals;
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

/** Security headers on every response. CSP itself comes from Kit (vite.config.ts). */
const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	if (!dev)
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	return response;
};

/**
 * A member with a saved language always gets the portal in that language:
 * page GETs on the "wrong" prefix redirect to the preferred one. Only real
 * page navigations count, so form actions, webhooks and assets are untouched,
 * and members without a saved language keep the URL-decides behaviour.
 */
const handleLocalePreference: Handle = async ({ event, resolve }) => {
	const { pathname, search } = event.url;
	if (
		event.locals.user &&
		event.request.method === 'GET' &&
		(event.request.headers.get('accept') ?? '').includes('text/html') &&
		!pathname.startsWith('/api') &&
		!pathname.startsWith('/webhooks') &&
		!pathname.startsWith('/internal') &&
		!pathname.startsWith('/avatar') &&
		!pathname.startsWith('/board-avatar') &&
		!pathname.startsWith('/documents') &&
		!pathname.startsWith('/assets')
	) {
		const me = await getMemberByUserId(getDb(event.platform!.env.DB), event.locals.user.id);
		const pref = me?.preferredLocale;
		if (pref) {
			const urlLocale = pathname === '/fi' || pathname.startsWith('/fi/') ? 'fi' : 'en';
			if (pref !== urlLocale) {
				const bare = urlLocale === 'fi' ? pathname.replace(/^\/fi/, '') || '/' : pathname;
				const target = pref === 'fi' ? (bare === '/' ? '/fi' : `/fi${bare}`) : bare;
				redirect(303, target + search);
			}
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(
	handleSecurityHeaders,
	handleParaglide,
	handleBetterAuth,
	handleLocalePreference
);
