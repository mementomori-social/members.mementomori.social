<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { FEES } from '$lib/fees';
	import { isFullName } from '$lib/name';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const chosePlain = $derived(page.url.searchParams.get('path') === 'form');
	// An error must keep the form on screen: dropping back to the choice screen
	// looks like the submit silently did nothing and loses what was typed.
	const showForm = $derived(
		Boolean(data.pendingMasto) || chosePlain || data.signedIn || Boolean(form?.error)
	);
	const sentTo = $derived(form?.email ?? '');

	// A Mastodon display name is usually a handle, and offering it as the
	// register name is what put handles in the register to begin with.
	const prefillName = $derived(
		data.pendingMasto?.name && isFullName(data.pendingMasto.name) ? data.pendingMasto.name : ''
	);

	// The billing labels quote the price of the class chosen just above.
	let memberClass = $state<'member' | 'supporting'>('member');
	const fee = $derived(FEES[memberClass]);
</script>

<h1>{form?.magicSent ? m.check_email_heading() : m.join_heading()}</h1>

{#if form?.magicSent}
	<p class="notice ok" role="status">✓ {m.join_check_email()}</p>
	<p>{m.check_email_steps({ email: sentTo })}</p>
{:else if !showForm}
	<p>{m.join_intro()}</p>

	<div class="tiers">
		<div class="tier">
			<h3>{m.choice_masto_title()}</h3>
			<p class="muted small">{m.choice_masto_desc()}</p>
			<a class="button" href={localizeHref('/join/mastodon')}>
				<img class="btn-icon" src="/assets/mastodon.svg" alt="" />{m.choice_masto_cta()}</a
			>
		</div>
		<div class="tier">
			<h3>{m.choice_form_title()}</h3>
			<p class="muted small">{m.choice_form_desc()}</p>
			<a class="button ghost" href={localizeHref('/join?path=form')}>{m.choice_form_cta()}</a>
		</div>
	</div>

	<p class="muted small">
		{m.join_rules_1()}
		<a href="/documents/mementomori-ry-saannot.pdf">{m.join_rules_link()}</a>.
		<a href={localizeHref('/faq/miksi-liittya')}>{m.join_faq_hint()}</a>
	</p>
{:else}
	{#if data.pendingMasto}
		<p class="notice ok" role="status">✓ {m.verified_as({ acct: data.pendingMasto.acct })}</p>
	{/if}

	<form method="POST" action="?/apply" class="stack" use:enhance>
		<label class="field">
			{m.field_full_name()}
			<input
				type="text"
				name="fullName"
				required
				title={m.err_full_name_required()}
				placeholder={m.ph_full_name()}
				value={form?.fullName ?? prefillName}
			/>
		</label>
		<p class="muted small" style="margin:0">{m.join_full_name_note()}</p>
		<label class="field">
			{m.field_municipality()}
			<input
				type="text"
				name="homeMunicipality"
				required
				placeholder={m.ph_municipality()}
				value={form?.homeMunicipality ?? ''}
			/>
		</label>
		<p class="muted small" style="margin:0">{m.municipality_note()}</p>

		{#if !data.signedIn}
			<label class="field">
				{m.field_email()}
				<input
					type="email"
					name="email"
					required
					placeholder={m.ph_email()}
					value={form?.email ?? ''}
				/>
			</label>
			{#if data.pendingMasto}
				<p class="muted small" style="margin:0">{m.email_masto_note()}</p>
			{/if}
		{/if}

		<fieldset style="border:none;padding:0;margin:6px 0 0;display:grid;gap:8px">
			<label class="check">
				<input type="radio" name="memberClass" value="member" bind:group={memberClass} />
				<span
					><strong>{m.class_member()}</strong>,
					{m.option_member_rest({ year: FEES.member.year, month: FEES.member.month })}</span
				>
			</label>
			<label class="check">
				<input type="radio" name="memberClass" value="supporting" bind:group={memberClass} />
				<span
					><strong>{m.class_patron()}</strong>,
					{m.option_patron_rest({
						year: FEES.supporting.year,
						month: FEES.supporting.month
					})}</span
				>
			</label>
		</fieldset>

		<fieldset style="border:none;padding:0;margin:6px 0 0;display:grid;gap:8px">
			<label class="check">
				<input type="radio" name="billingInterval" value="month" checked />
				<span>{m.pay_month({ month: fee.month })}</span>
			</label>
			<label class="check">
				<input type="radio" name="billingInterval" value="year" />
				<span>{m.pay_year({ year: fee.year })}</span>
			</label>
		</fieldset>

		<label class="check">
			<input type="checkbox" name="listedConsent" />
			<span>{m.consent_label()}</span>
		</label>

		<label class="check">
			<input type="checkbox" name="publicConsent" />
			<span
				>{m.consent_public_label()}
				<a href={localizeHref('/privacy')}>{m.nav_privacy()}</a></span
			>
		</label>

		{#if form?.error}<p class="error">{form.error}</p>{/if}

		<div class="btn-row">
			<button type="submit">{m.submit_application()}</button>
			<button type="submit" class="danger" formaction="?/cancel" formnovalidate>
				{m.join_cancel()}
			</button>
		</div>
	</form>
{/if}
