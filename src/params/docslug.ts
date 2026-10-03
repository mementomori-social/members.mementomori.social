import type { ParamMatcher } from '@sveltejs/kit';

/** A dot means a file, which the PDF route serves, never the document page. */
export const match: ParamMatcher = (param) => /^[a-z0-9-]+$/.test(param);
