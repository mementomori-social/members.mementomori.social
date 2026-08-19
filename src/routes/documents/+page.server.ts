import type { PageServerLoad } from './$types';
import { DOCUMENTS } from '$lib/documents';
import { DOCUMENT_SIZES } from '$lib/document-sizes';

export const load: PageServerLoad = async () => ({
	sizes: Object.fromEntries(DOCUMENTS.map((d) => [d.slug, DOCUMENT_SIZES[d.file] ?? 0]))
});
