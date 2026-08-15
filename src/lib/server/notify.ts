import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

/**
 * Board notifications into the Matrix admins room, the same room that
 * already receives Mastodon signup and report webhooks. Uses the existing
 * bot's credentials; without them configured this is a no-op.
 */
export const notifyEnabled = () =>
	Boolean(env.MATRIX_BASE_URL && env.MATRIX_ACCESS_TOKEN && env.MATRIX_ROOM_ID);

/** RFC 2606 reserves .invalid, so no real applicant can hold such an address. */
export const isTestAddress = (email: string | null | undefined) =>
	Boolean(email && /\.invalid$/i.test(email.trim()));

const esc = (v: string) =>
	v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/**
 * Message in the signup-report-monitor house style: emoji header, bold
 * "Label: value" lines, bold action link, plain/HTML pair joined with <br>.
 */
export function boardMessage(
	header: string,
	fields: Array<[string, string]>,
	link: { label: string; url: string }
): { plain: string; html: string } {
	const plainLines = [header];
	const htmlLines = [header.replace(/^(\S+) (.*)$/, '$1 <strong>$2</strong>')];
	for (const [label, value] of fields) {
		plainLines.push(`${label}: ${value}`);
		htmlLines.push(`<strong>${esc(label)}:</strong> ${esc(value)}`);
	}
	plainLines.push(`${link.label}: ${link.url}`);
	htmlLines.push(`<strong><a href="${esc(link.url)}">${esc(link.label)}</a></strong>`);
	return { plain: plainLines.join('\n'), html: htmlLines.join('<br>') };
}

export async function notifyBoard(plain: string, html?: string): Promise<void> {
	// The dev server shares production Matrix credentials, so without this a
	// local test lands in the board's room as a real application.
	if (dev) {
		console.log(`[notify:dev] ${plain}`);
		return;
	}
	if (!notifyEnabled()) {
		console.log(`[notify] ${plain}`);
		return;
	}
	try {
		const room = encodeURIComponent(env.MATRIX_ROOM_ID!);
		const txn = crypto.randomUUID();
		const res = await fetch(
			`${env.MATRIX_BASE_URL!.replace(/\/$/, '')}/_matrix/client/v3/rooms/${room}/send/m.room.message/${txn}`,
			{
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${env.MATRIX_ACCESS_TOKEN}`,
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					msgtype: 'm.text',
					body: plain,
					...(html ? { format: 'org.matrix.custom.html', formatted_body: html } : {})
				})
			}
		);
		if (!res.ok) console.error(`Matrix notify failed: ${res.status}`);
	} catch (e) {
		// Never let a notification failure break the member-facing flow.
		console.error('Matrix notify failed:', e);
	}
}
