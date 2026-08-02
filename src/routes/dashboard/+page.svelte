<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
	import { authClient } from '$lib/auth-client';
	import { COSTS } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const fmt = (d: Date | string) => new Date(d).toLocaleDateString('fi-FI');

	async function linkMastodon() {
		await authClient.oauth2.link({ providerId: 'mastodon', callbackURL: '/dashboard' });
	}

	async function signOut() {
		await authClient.signOut();
		goto('/', { invalidateAll: true });
	}
</script>

<h1>{m.dash_heading()}</h1>

{#if page.url.searchParams.get('paid') === '1'}
	<p class="notice">{m.paid_thanks()}</p>
{/if}

<div class="card">
	<h3>{m.card_membership()}</h3>
	<p>
		{data.m.fullName}, {data.m.homeMunicipality}<br />
		<span class="muted small">
			{data.m.memberClass === 'member' ? m.class_member() : m.class_patron()},
			{m.fee_year_line({ year: data.fee.year })}{data.m.billingInterval === 'month'
				? ` ${m.fee_month_suffix({ month: data.fee.month })}`
				: ''}
		</span>
	</p>
	{#if data.m.status === 'applied'}
		<span class="badge accent">{m.status_awaiting()}</span>
	{:else if data.m.status === 'approved'}
		<span class="badge ok">{m.status_approved()}</span>
	{:else}
		<span class="badge"
			>{data.m.status === 'rejected' ? m.status_rejected() : m.status_ended()}</span
		>
	{/if}
</div>

<div class="card">
	<h3>{m.card_masto()}</h3>
	{#if data.mastodonLinked}
		<p class="small">
			{m.masto_linked()}{data.m.mastodonAcct ? `: @${data.m.mastodonAcct}` : ''}.
			{#if data.m.mastodonAvatarUrl}
				<img
					src="/avatar/{data.m.id}"
					alt=""
					style="width:44px;height:44px;border-radius:10px;vertical-align:middle;margin-left:10px"
				/>
			{/if}
		</p>
		<form method="POST" action="?/syncMastodon" use:enhance>
			<button class="ghost" type="submit">{m.masto_refresh()}</button>
			{#if form?.syncError}<p class="error">{form.syncError}</p>{/if}
		</form>
		<p class="muted small">{m.masto_signin_note()}</p>
	{:else}
		<button class="ghost" onclick={linkMastodon}>{m.masto_link_cta()}</button>
		<p class="muted small">{m.masto_link_note()}</p>
	{/if}
</div>

<div class="card">
	<h3>{m.card_payments()}</h3>
	{#if data.canPay}
		<form method="POST" action="?/pay" style="margin-bottom:14px">
			<button type="submit">{m.pay_now()}</button>
			<p class="muted small" style="margin:8px 0 0">{m.pay_redirect_note()}</p>
			{#if form?.payError}<p class="error">{form.payError}</p>{/if}
		</form>
	{/if}
	{#if data.payments.length === 0}
		<p class="muted small">{m.payments_none()}</p>
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
	<h3>{m.matrix_heading()}</h3>
	<p class="muted small">{m.dash_matrix_note()}</p>
	<a class="button ghost" href="/matrix">{m.matrix_heading()}</a>
</div>

<div class="card">
	<h3>{m.covered_heading()}</h3>
	<div class="progress">
		<div style="width: {Math.min(100, (data.collectedEur / COSTS.annualEur) * 100)}%"></div>
	</div>
	<p class="muted small">
		{m.covered_line({ collected: data.collectedEur.toFixed(2), annual: COSTS.annualEur })}
		{m.costs_monthly_note({ monthly: COSTS.monthlyEur })}
	</p>
</div>

<p><button class="danger" onclick={signOut}>{m.sign_out()}</button></p>
