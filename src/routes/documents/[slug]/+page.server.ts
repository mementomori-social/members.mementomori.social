import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findDocument } from '$lib/documents';
import { DOCUMENT_SIZES } from '$lib/document-sizes';

export const load: PageServerLoad = async ({ params }) => {
	const doc = findDocument(params.slug);
	if (!doc) error(404, 'Not found');
	return { slug: doc.slug, size: DOCUMENT_SIZES[doc.file] ?? 0 };
};
