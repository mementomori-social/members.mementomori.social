import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getDb } from '$lib/server/db';
import { member, user } from '$lib/server/db/schema';
import { getMemberByUserId } from '$lib/server/members';
import { FEES, type MemberClass } from '$lib/fees';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (locals.user) {
		const existing = await getMemberByUserId(getDb(platform!.env.DB), locals.user.id);
		if (existing) redirect(303, '/dashboard');
	}
	return { signedIn: Boolean(locals.user) };
};

const applyBootstrapRole = async (db: ReturnType<typeof getDb>, email: string) => {
	// BOOTSTRAP_ROLES="a@b.fi=chair,c@d.fi=vice"
	const entry = (env.BOOTSTRAP_ROLES ?? '')
		.split(',')
		.map((s) => s.trim().split('='))
		.find(([e]) => e?.toLowerCase() === email.toLowerCase());
	if (entry?.[1]) await db.update(user).set({ role: entry[1] }).where(eq(user.email, email));
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const db = getDb(platform!.env.DB);
		const form = await request.formData();

		const fullName = String(form.get('fullName') ?? '').trim();
		const homeMunicipality = String(form.get('homeMunicipality') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const memberClass = String(form.get('memberClass') ?? 'member') as MemberClass;
		const billingInterval = form.get('billingInterval') === 'month' ? 'month' : 'year';
		const listedConsent = form.get('listedConsent') === 'on';

		const values = { fullName, homeMunicipality, email, memberClass, billingInterval };
		if (!fullName || !homeMunicipality)
			return fail(400, { ...values, error: 'Full name and home municipality are required.' });
		if (!(memberClass in FEES)) return fail(400, { ...values, error: 'Unknown membership class.' });

		let userId = locals.user?.id;
		if (!userId) {
			if (!email || !password)
				return fail(400, { ...values, error: 'Email and password are required.' });
			try {
				const res = await locals.auth.api.signUpEmail({
					body: { name: fullName, email, password }
				});
				userId = res.user.id;
			} catch (e) {
				const msg = e instanceof APIError ? e.message : 'Could not create the account.';
				return fail(400, { ...values, error: msg });
			}
			await applyBootstrapRole(db, email);
		}

		await db.insert(member).values({
			userId: userId!,
			fullName,
			homeMunicipality,
			email: email || locals.user?.email || '',
			memberClass,
			billingInterval,
			listedConsent
		});

		redirect(303, '/dashboard');
	}
};
