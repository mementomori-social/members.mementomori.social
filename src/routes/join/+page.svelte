<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { FEES } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const chosePlain = $derived(page.url.searchParams.get('path') === 'form');
	const showForm = $derived(Boolean(data.pendingMasto) || chosePlain || data.signedIn);
</script>

<h1>{m.join_heading()}</h1>

{#if !showForm}
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
{:else if form?.magicSent}
	<p class="notice ok" role="status">✓ {m.join_check_email()}</p>
{:else}
	{#if data.pendingMasto}
		<p class="notice">{m.verified_as({ acct: data.pendingMasto.acct })}</p>
	{/if}

	<form method="POST" class="stack" use:enhance>
		<label class="field">
			{m.field_full_name()}
			<input
				type="text"
				name="fullName"
				required
				placeholder={m.ph_full_name()}
				value={form?.fullName ?? data.pendingMasto?.name ?? ''}
			/>
		</label>
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
				<input type="radio" name="memberClass" value="member" checked />
				<span
					><strong>{m.class_member()}</strong>,
					{m.option_member_rest({ year: FEES.member.year, month: FEES.member.month })}</span
				>
			</label>
			<label class="check">
				<input type="radio" name="memberClass" value="supporting" />
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
				<input type="radio" name="billingInterval" value="year" checked />
				<span>{m.pay_year()}</span>
			</label>
			<label class="check">
				<input type="radio" name="billingInterval" value="month" />
				<span>{m.pay_month()}</span>
			</label>
		</fieldset>

		<label class="check">
			<input type="checkbox" name="listedConsent" />
			<span>{m.consent_label()}</span>
		</label>

		{#if form?.error}<p class="error">{form.error}</p>{/if}

		<div><button type="submit">{m.submit_application()}</button></div>
	</form>
{/if}
