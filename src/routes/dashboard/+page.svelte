<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';
	import CopyField from '$lib/components/CopyField.svelte';
	import { COSTS, coverage } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let syncing = $state(false);

	const cov = $derived(coverage(data.collectedEur.fees, data.collectedEur.income));

	const fmt = (d: Date | string) => new Date(d).toLocaleDateString('fi-FI');

	async function linkMastodon() {
		await authClient.oauth2.link({ providerId: 'mastodon', callbackURL: '/dashboard' });
	}
</script>

<header class="dash-head">
	<h1>{m.dash_greeting({ name: (data.m.displayName ?? data.m.fullName).split(' ')[0] })}</h1>
	<p class="dash-summary">
		{data.m.displayName ?? data.m.fullName} · {data.m.homeMunicipality} ·
		{data.m.memberClass === 'member' ? m.class_member() : m.class_patron()} ·
		{m.fee_year_line({ year: data.fee.year })}{data.m.billingInterval === 'month'
			? ` ${m.fee_month_suffix({ month: data.fee.month })}`
			: ''}
	</p>
	<p class="status-pill">
		<span
			class="dot"
			class:ok={data.m.status === 'approved'}
			class:pending={data.m.status === 'applied'}
			class:bad={data.m.status === 'rejected' || data.m.status === 'ended'}
		></span>
		{data.m.status === 'approved'
			? m.dash_status_active()
			: data.m.status === 'applied'
				? m.dash_status_applied()
				: data.m.status === 'rejected'
					? m.dash_status_rejected()
					: m.dash_status_ended()}
	</p>
</header>

{#if page.url.searchParams.get('paid') === '1'}
	<p class="notice ok" role="status">✓ {m.paid_thanks()}</p>
{/if}

<div class="dash-grid">
	<div class="card span2">
		<h3>{m.card_payments()}</h3>
		{#if data.m.status === 'approved'}
			<p class="fee-state" class:ok={data.covered} class:bad={!data.covered}>
				<span class="dot"></span>
				{#if data.covered && data.paidUntil}
					{m.fee_status_paid({ date: new Date(data.paidUntil).toLocaleDateString('fi-FI') })}
				{:else}
					{m.fee_status_due({ amount: data.dueAmountEur })}
				{/if}
			</p>
		{/if}
		{#if data.canPay}
			<form method="POST" action="?/pay" class="fee-actions">
				<button type="submit">{m.pay_now()}</button>
				<span class="muted small">{m.pay_redirect_note()}</span>
				{#if form?.payError}<p class="error">{form.payError}</p>{/if}
			</form>
		{/if}
		{#if data.bank}
			<div class="callout" style="margin-bottom:14px">
				<h4>{m.bank_heading()}</h4>
				<CopyField label={m.bank_recipient()} display="Mementomori ry" />
				<CopyField
					label={m.bank_iban()}
					display={data.bank.iban}
					copyValue={data.bank.ibanCompact}
				/>
				<CopyField
					label={m.bank_reference()}
					display={data.bank.viite}
					copyValue={data.bank.viiteRaw}
				/>
				<CopyField
					label={m.bank_amount()}
					display="{data.bank.amountEur} €"
					copyValue={data.bank.amountEur.toFixed(2).replace('.', ',')}
				/>
				{#if data.bank.barcode}
					<CopyField label={m.bank_barcode()} display={data.bank.barcode} />
				{/if}
				<p class="hint">
					{#if data.bank.barcode}{m.bank_barcode_note()}{/if}
					{m.bank_note()}
				</p>
			</div>
		{/if}
		{#if data.payments.length === 0}
			<p class="muted small">
				{data.m.status === 'approved' ? m.payments_none_approved() : m.payments_none()}
			</p>
		{:else}
			<h4 class="subhead">{m.payment_history()}</h4>
			<table class="list">
				<thead>
					<tr
						><th>{m.th_date()}</th><th>{m.th_amount()}</th><th>{m.th_method()}</th><th
							>{m.th_period()}</th
						></tr
					>
				</thead>
				<tbody>
					{#each data.payments as p (p.paidAt)}
						<tr>
							<td>{fmt(p.paidAt)}</td>
							<td>{p.amountEur.toFixed(2)}&nbsp;€</td>
							<td>{p.method === 'bank' ? m.method_bank() : m.method_stripe()}</td>
							<td class="muted small">{fmt(p.periodStart)} {m.period_to()} {fmt(p.periodEnd)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>

	<div class="card">
		<h3>{m.card_masto()}</h3>
		{#if data.mastodonLinked}
			<div class="profile">
				{#if data.m.mastodonAvatarUrl}
					<img class="profile-avatar" src="/avatar/{data.m.id}" alt="" />
				{/if}
				<div class="profile-body">
					<strong class="profile-name"
						>{data.mastoProfile?.displayName ?? data.m.mastodonAcct}</strong
					>
					<span class="muted small">@{data.m.mastodonAcct}@mementomori.social</span>
					{#if data.mastoProfile?.bio}
						<p class="small profile-bio">{data.mastoProfile.bio}</p>
					{/if}
					<span class="profile-actions small">
						{#if data.mastoProfile?.url}
							<a href={data.mastoProfile.url}>{m.masto_view_profile()}</a>
						{/if}
						<form
							method="POST"
							action="?/syncMastodon"
							use:enhance={() => {
								syncing = true;
								return async ({ update }) => {
									await update();
									syncing = false;
								};
							}}
						>
							<button class="linklike" type="submit" disabled={syncing}>
								{syncing ? m.masto_refreshing() : m.masto_refresh()}
							</button>
						</form>
						{#if form?.synced && !syncing}
							<span class="ok-note" role="status">✓ {m.masto_synced()}</span>
						{/if}
					</span>
					{#if form?.syncError}<p class="error">{form.syncError}</p>{/if}
				</div>
			</div>
		{:else}
			<button class="ghost" onclick={linkMastodon}>{m.masto_link_cta()}</button>
			<p class="muted small">{m.masto_link_note()}</p>
		{/if}
	</div>

	<div class="card">
		<h3>{m.card_matrix()}</h3>
		<p class="muted small">{m.dash_matrix_note()}</p>
		<a class="button ghost" href={localizeHref('/matrix')}>{m.matrix_open_cta()}</a>
	</div>

	<div class="card span2">
		<h3>{m.visibility_heading()}</h3>
		<form method="POST" action="?/saveVisibility" class="stack consent-form" use:enhance>
			<label class="check">
				<input type="checkbox" name="listedConsent" checked={data.m.listedConsent} />
				<span>{m.consent_label()}</span>
			</label>
			<label class="check">
				<input type="checkbox" name="publicConsent" checked={data.m.publicConsent} />
				<span
					>{m.consent_public_label()}
					<a href={localizeHref('/privacy')}>{m.nav_privacy()}</a></span
				>
			</label>
			<div>
				<button type="submit" class="ghost">{m.save()}</button>
				{#if form?.visibilitySaved}
					<span class="ok-note" role="status">✓ {m.saved()}</span>
				{/if}
			</div>
		</form>
	</div>

	<div class="card span2">
		<h3>{m.covered_heading({ year: new Date().getFullYear() })}</h3>
		<p class="covered-total">
			<strong
				>{Math.max(0, COSTS.annualEur - cov.total)
					.toFixed(2)
					.replace('.', ',')}&nbsp;€</strong
			>
			<span class="muted small">{m.covered_big_label()}</span>
		</p>
		<div class="progress stacked">
			<div class="seg-month" style="width: {(cov.members / COSTS.annualEur) * 100}%"></div>
			<div class="seg-earlier" style="width: {(cov.support / COSTS.annualEur) * 100}%"></div>
			<div class="seg-upcoming" style="width: {(cov.upcoming / COSTS.annualEur) * 100}%"></div>
		</div>
		<p class="legend small">
			<span
				><span class="dot ok"></span>
				{m.covered_seg_members()}: {cov.members.toFixed(2).replace('.', ',')}&nbsp;€</span
			>
			<span
				><span class="dot accent"></span>
				{m.covered_seg_support()}: {cov.support.toFixed(2).replace('.', ',')}&nbsp;€</span
			>
			<span
				><span class="dot warn"></span>
				{m.covered_seg_upcoming()}: {cov.upcoming.toFixed(2).replace('.', ',')}&nbsp;€</span
			>
			<span
				><span class="dot bad"></span>
				{m.covered_left({
					left: Math.max(0, COSTS.annualEur - cov.total)
						.toFixed(2)
						.replace('.', ',')
				})}</span
			>
		</p>

		<p class="muted small">{m.costs_monthly_note({ monthly: COSTS.monthlyEur })}</p>
	</div>

	<div class="card span2">
		<h3>{m.servers_covered_heading()}</h3>
		<p class="covered-total">
			<strong>{cov.coveredUntil.toLocaleDateString('fi-FI')}</strong>
			<span
				class="fee-state inline"
				class:ok={cov.marginDays > 14}
				class:warn={cov.marginDays > 0 && cov.marginDays <= 14}
				class:bad={cov.marginDays <= 0}
			>
				<span class="dot"></span>
				{cov.marginDays > 0
					? m.servers_covered_days({ days: cov.marginDays })
					: m.servers_covered_past()}
			</span>
		</p>
		<div class="progress year-track">
			<div class="fill" style="width: {cov.coveredPct}%"></div>
			<span class="covered-date" style="left: {cov.coveredPct}%"
				>{cov.coveredUntil.toLocaleDateString('fi-FI')}</span
			>
		</div>
		<p class="bar-meta small">
			<span class:ok={cov.total > 0} class:muted={cov.total === 0}
				>1.1.{new Date().getFullYear()}</span
			>
			<span class="muted">31.12.{new Date().getFullYear()}</span>
		</p>
	</div>
</div>
