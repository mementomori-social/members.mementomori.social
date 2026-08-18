import { m } from '$lib/paraglide/messages.js';

/**
 * The association's published documents. The PDF paths are permanent: they
 * have been shared as links, so a file name here is never renamed.
 */
export const DOCUMENTS = [
	{
		slug: 'saannot',
		file: '/documents/mementomori-ry-saannot.pdf',
		title: () => m.doc_rules_title(),
		meta: () => m.doc_rules_meta(),
		fileName: () => m.doc_rules_file()
	},
	{
		slug: 'perustamiskirja',
		file: '/documents/mementomori-ry-perustamiskirja.pdf',
		title: () => m.doc_charter_title(),
		meta: () => m.doc_charter_meta(),
		fileName: () => m.doc_charter_file()
	}
] as const;

export type DocumentSlug = (typeof DOCUMENTS)[number]['slug'];

export const findDocument = (slug: string) => DOCUMENTS.find((d) => d.slug === slug);
