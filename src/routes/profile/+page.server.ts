import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { account, member } from '$lib/server/db/schema';
import { getMemberByUserId } from '$lib/server/members';
import { isFullName } from '$lib/name';
import { m } from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const db = getDb(platform!.env.DB);
	const me = await getMemberByUserId(db, locals.user.id);
	if (!me) redirect(303, '/join');
	const linked = await db.query.account.findFirst({
		where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'mastodon'))
	});
	return {
		nameIncomplete: !isFullName(me.fullName, me.mastodonAcct),
		me: {
			id: me.id,
			fullName: me.fullName,
			displayName: me.displayName,
			homeMunicipality: me.homeMunicipality,
			email: me.email ?? locals.user.email,
			mastodonAcct: me.mastodonAcct,
			hasAvatar: Boolean(me.mastodonAvatarUrl),
			matrixId: me.matrixId
		},
		mastodonLinked: Boolean(linked)
	};
};

export const actions: Actions = {
	saveProfile: async ({ request, locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const me = await getMemberByUserId(db, locals.user.id);
		if (!me) redirect(303, '/join');

		const form = await request.formData();
		const fullName = String(form.get('fullName') ?? '').trim();
		const displayName = String(form.get('displayName') ?? '').trim();
		const homeMunicipality = String(form.get('homeMunicipality') ?? '').trim();
		if (!fullName || !homeMunicipality)
			return fail(400, { profileError: m.err_name_municipality_required() });
		if (!isFullName(fullName, me.mastodonAcct))
			return fail(400, { profileError: m.err_full_name_required() });

		await db
			.update(member)
			.set({ fullName, displayName: displayName || null, homeMunicipality })
			.where(eq(member.id, me.id));
		return { profileSaved: true };
	},

	/**
	 * Unlinking keeps the account usable: magic links to the verified email
	 * remain a sign-in method, so no one can lock themselves out.
	 */
	unlinkMastodon: async ({ locals, platform }) => {
		if (!locals.user) redirect(303, '/login');
		const db = getDb(platform!.env.DB);
		const me = await getMemberByUserId(db, locals.user.id);
		if (!me) redirect(303, '/join');

		await db
			.delete(account)
			.where(and(eq(account.userId, locals.user.id), eq(account.providerId, 'mastodon')));
		await db
			.update(member)
			.set({ mastodonAcct: null, mastodonAvatarUrl: null })
			.where(eq(member.id, me.id));
		return { unlinked: true };
	}
};
