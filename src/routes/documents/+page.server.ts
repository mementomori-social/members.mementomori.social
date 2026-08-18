import type { PageServerLoad } from './$types';
import { DOCUMENTS } from '$lib/documents';
import { documentSize } from '$lib/server/documents';

export const load: PageServerLoad = async ({ fetch }) => {
	const sizes: Record<string, number> = {};
	for (const doc of DOCUMENTS) sizes[doc.slug] = await documentSize(fetch, doc.file);
	return { sizes };
};
