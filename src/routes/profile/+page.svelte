<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';
	import CopyField from '$lib/components/CopyField.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	async function linkMastodon() {
		await authClient.oauth2.link({ providerId: 'mastodon', callbackURL: '/profile' });
	}
</script>

<h1>{m.profile_heading()}</h1>

<p class="muted small">{m.profile_intro()}</p>

{#if data.nameIncomplete}
	<p class="notice name-required" role="alert">{m.fix_name_prompt()}</p>
{/if}

<div class="card card-text-width">
	{#if data.me.memberNumber}
		<div class="member-no">
			<span class="muted small">{m.th_member_number()}</span>
			<CopyField display={String(data.me.memberNumber)} />
		</div>
	{/if}
	<form
		method="POST"
		action="?/saveProfile"
		class="stack field-grid"
		use:enhance={() =>
			async ({ update }) =>
				update({ reset: false })}
	>
		<div class="field-block">
			<label class="field">
				{m.field_display_name()}
				<input
					type="text"
					name="displayName"
					placeholder={m.ph_display_name()}
					value={data.me.displayName ?? ''}
				/>
			</label>
			<p class="muted small field-note">{m.display_name_note()}</p>
		</div>
		<div class="field-block">
			<label class="field">
				{m.field_full_name()}
				<input type="text" name="fullName" required value={data.me.fullName} />
			</label>
			<p class="muted small field-note">{m.full_name_note()}</p>
		</div>
		<div class="field-block">
			<label class="field">
				{m.field_municipality()}
				<input type="text" name="homeMunicipality" required value={data.me.homeMunicipality} />
			</label>
		</div>
		<div class="field-block">
			<label class="field">
				{m.matrix_id_label()}
				<input
					type="text"
					name="matrixId"
					placeholder="@sina:matrix.org"
					value={data.me.matrixId ?? ''}
				/>
			</label>
			<p class="muted small field-note">
				{m.matrix_profile_note()}
				<a href={localizeHref('/matrix')}>{m.matrix_profile_link()}</a>{m.matrix_profile_note_end()}
			</p>
		</div>
		<div class="field-block">
			<label class="field">
				{m.lang_pref_label()}
				<select name="preferredLocale">
					<option value="" selected={!data.me.preferredLocale}>{m.lang_pref_none()}</option>
					<option value="fi" selected={data.me.preferredLocale === 'fi'}>Suomi</option>
					<option value="en" selected={data.me.preferredLocale === 'en'}>English</option>
				</select>
			</label>
			<p class="muted small field-note">{m.lang_pref_note()}</p>
		</div>
		<div class="form-actions">
			<button type="submit" class="ghost">{m.save()}</button>
			{#if form?.profileSaved}<span class="ok-note" role="status">✓ {m.saved()}</span>{/if}
		</div>
		{#if form?.profileError}<p class="error">{form.profileError}</p>{/if}
	</form>
</div>

<div class="card card-text-width">
	<h3>{m.visibility_heading()}</h3>
	<form
		method="POST"
		action="?/saveVisibility"
		class="stack consent-form"
		use:enhance={() =>
			async ({ update }) =>
				update({ reset: false })}
	>
		<label class="check">
			<input type="checkbox" name="listedConsent" checked={data.me.listedConsent} />
			<span>{m.consent_label()}</span>
		</label>
		<label class="check">
			<input type="checkbox" name="publicConsent" checked={data.me.publicConsent} />
			<span
				>{m.consent_public_label()}
				<a href={localizeHref('/privacy')}>{m.nav_privacy()}</a></span
			>
		</label>
		<div>
			<button type="submit" class="ghost">{m.save_consent()}</button>
			{#if form?.visibilitySaved}
				<span class="ok-note" role="status">✓ {m.saved()}</span>
			{/if}
		</div>
	</form>
</div>

<div class="card card-text-width">
	<h3>{m.field_email()}</h3>
	<p>{data.me.email}</p>
	<p class="muted small">
		{m.email_change_note()}
		<a href="mailto:ry@mementomori.social">ry@mementomori.social</a>
	</p>
</div>

<div class="card card-text-width">
	<h3>{m.card_masto()}</h3>
	{#if data.mastodonLinked}
		<div class="profile">
			{#if data.me.hasAvatar}
				<img class="profile-avatar" src="/avatar/{data.me.id}" alt="" />
			{/if}
			<div class="profile-body">
				{#if data.me.mastodonAcct}
					<span class="muted small">@{data.me.mastodonAcct}@mementomori.social</span>
				{/if}
				<form method="POST" action="?/unlinkMastodon" use:enhance>
					<button type="submit" class="linklike">{m.masto_unlink()}</button>
				</form>
			</div>
		</div>
	{:else}
		<button class="ghost" onclick={linkMastodon}>{m.masto_link_cta()}</button>
		<p class="muted small">{m.masto_link_note()}</p>
	{/if}
	{#if form?.unlinked}<p class="ok-note small" role="status">✓ {m.masto_unlinked()}</p>{/if}
</div>

<p class="small">
	<a href={localizeHref('/matrix')}>{m.matrix_open_cta()}</a> ·
	<a href={localizeHref('/dashboard')}>{m.nav_dashboard()}</a>
</p>
