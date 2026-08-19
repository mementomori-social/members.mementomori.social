import type { PageServerLoad } from './$types';
import { BRAND_KIT_SIZE } from '$lib/document-sizes';

export const load: PageServerLoad = async () => ({ kitSize: BRAND_KIT_SIZE });
