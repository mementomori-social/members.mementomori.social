import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findDocument } from '$lib/documents';
import { documentSize } from '$lib/server/documents';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const doc = findDocument(params.slug);
	if (!doc) error(404, 'Not found');
	return { slug: doc.slug, size: await documentSize(fetch, doc.file) };
};
