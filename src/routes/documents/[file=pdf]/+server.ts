import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DOCUMENTS } from '$lib/documents';

const MOVED_PERMANENTLY = 301;

/**
 * The PDFs live at the root path. A language-prefixed link (/fi/documents/x.pdf)
 * reaches this route instead of the static file, so send it to the real one.
 */
export const GET: RequestHandler = ({ params }) => {
	const file = `/documents/${params.file}`;
	if (!DOCUMENTS.some((doc) => doc.file === file)) {
		error(404, 'Not found');
	}
	redirect(MOVED_PERMANENTLY, file);
};
