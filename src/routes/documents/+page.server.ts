import type { PageServerLoad } from './$types';

/**
 * Sizes come from the deployed files, so a link can never claim a size the
 * file no longer has. Cached per isolate: the PDFs only change on deploy.
 */
const cache = new Map<string, number>();

async function size(fetch: typeof globalThis.fetch, path: string) {
	const known = cache.get(path);
	if (known !== undefined) return known;
	const res = await fetch(path);
	const bytes = Number(res.headers.get('content-length') ?? 0) || (await res.arrayBuffer()).byteLength;
	cache.set(path, bytes);
	return bytes;
}

export const load: PageServerLoad = async ({ fetch }) => ({
	sizes: {
		rules: await size(fetch, '/documents/mementomori-ry-saannot.pdf'),
		charter: await size(fetch, '/documents/mementomori-ry-perustamiskirja.pdf')
	}
});
