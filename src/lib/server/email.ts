import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

/**
 * Transactional email through the Mailgun EU HTTP API (Workers cannot speak
 * SMTP). In dev without an API key the message is logged so magic links can
 * be tested offline.
 */
export async function sendEmail(to: string, subject: string, text: string) {
	if (!env.MAILGUN_API_KEY) {
		if (dev) {
			console.log(`[email] to=${to} subject=${subject}\n${text}`);
			return;
		}
		throw new Error('MAILGUN_API_KEY is not set');
	}

	const body = new URLSearchParams({
		from: 'Mementomori ry <members@mementomori.social>',
		to,
		subject,
		text
	});
	const res = await fetch('https://api.eu.mailgun.net/v3/mementomori.social/messages', {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`api:${env.MAILGUN_API_KEY}`)}`,
			'content-type': 'application/x-www-form-urlencoded'
		},
		body
	});
	if (!res.ok) throw new Error(`Mailgun send failed: ${res.status}`);
}
