<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { authClient } from '$lib/auth-client';
	import { COSTS } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let syncing = $state(false);

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
	<p class="notice">{m.paid_thanks()}</p>
{/if}

<div class="dash-grid">
	<div class="card span2">
		<h3>{m.card_payments()}</h3>
		{#if data.canPay}
			<form method="POST" action="?/pay" style="margin-bottom:14px">
				<button type="submit">{m.pay_now()}</button>
				<p class="muted small" style="margin:8px 0 0">{m.pay_redirect_note()}</p>
				{#if form?.payError}<p class="error">{form.payError}</p>{/if}
			</form>
		{/if}
		{#if data.bank}
			<div class="callout" style="margin-bottom:14px">
				<h4>{m.bank_heading()}</h4>
				<dl class="kv">
					<dt>{m.bank_recipient()}</dt>
					<dd>Mementomori ry</dd>
					<dt>{m.bank_iban()}</dt>
					<dd>{data.bank.iban}</dd>
					<dt>{m.bank_reference()}</dt>
					<dd><strong>{data.bank.viite}</strong></dd>
					<dt>{m.bank_amount()}</dt>
					<dd>{data.bank.amount.year}&nbsp;€</dd>
				</dl>
				<p class="hint">{m.bank_note()}</p>
			</div>
		{/if}
		{#if data.payments.length === 0}
			<p class="muted small">
				{data.m.status === 'approved' ? m.payments_none_approved() : m.payments_none()}
			</p>
		{:else}
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
		<a class="button ghost" href="/matrix">{m.matrix_open_cta()}</a>
	</div>

	<div class="card span2">
		<h3>{m.covered_heading()}</h3>
		<div class="progress">
			<div
				style="width: {Math.min(
					100,
					((data.collectedEur.fees + data.collectedEur.income) / COSTS.annualEur) * 100
				)}%"
			></div>
		</div>
		<p class="muted small">
			{m.covered_line_split({
				fees: data.collectedEur.fees.toFixed(2),
				income: data.collectedEur.income.toFixed(2),
				annual: COSTS.annualEur
			})}
			{m.costs_monthly_note({ monthly: COSTS.monthlyEur })}
			{m.sponsor_credit()}
		</p>
	</div>
</div>
