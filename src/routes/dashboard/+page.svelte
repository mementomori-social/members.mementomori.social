<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { COSTS } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const fmt = (d: Date | string) => new Date(d).toLocaleDateString('en-GB');

	async function linkMastodon() {
		await authClient.oauth2.link({ providerId: 'mastodon', callbackURL: '/dashboard' });
	}

	async function signOut() {
		await authClient.signOut();
		goto('/', { invalidateAll: true });
	}
</script>

<h1>Dashboard</h1>

<div class="card">
	<h3>Membership</h3>
	<p>
		{data.m.fullName}, {data.m.homeMunicipality}<br />
		<span class="muted small">
			{data.m.memberClass === 'member' ? 'Member' : 'Supporting member'},
			{data.fee.year}&nbsp;€/year{data.m.billingInterval === 'month'
				? ` in ${data.fee.month}&nbsp;€ monthly instalments`
				: ''}
		</span>
	</p>
	{#if data.m.status === 'applied'}
		<span class="badge accent">Awaiting board approval</span>
	{:else if data.m.status === 'approved'}
		<span class="badge ok">Approved member</span>
	{:else}
		<span class="badge">{data.m.status}</span>
	{/if}
</div>

<div class="card">
	<h3>mementomori.social account</h3>
	{#if data.mastodonLinked}
		<p class="small">
			Linked{data.m.mastodonAcct ? `: @${data.m.mastodonAcct}` : ''}.
			{#if data.m.mastodonAvatarUrl}
				<img
					src="/avatar/{data.m.id}"
					alt=""
					style="width:44px;height:44px;border-radius:10px;vertical-align:middle;margin-left:10px"
				/>
			{/if}
		</p>
		<form method="POST" action="?/syncMastodon" use:enhance>
			<button class="ghost" type="submit">Refresh name and avatar</button>
			{#if form?.syncError}<p class="error">{form.syncError}</p>{/if}
		</form>
		<p class="muted small">You can also sign in with Mastodon from now on.</p>
	{:else}
		<button class="ghost" onclick={linkMastodon}>Link mementomori.social account</button>
		<p class="muted small">
			Optional. Verifies your handle and shows your avatar on the member list.
		</p>
	{/if}
</div>

<div class="card">
	<h3>Payments</h3>
	{#if data.payments.length === 0}
		<p class="muted small">
			No payments recorded yet. Payment instructions arrive by email once the board has approved
			your application.
		</p>
	{:else}
		<table class="list">
			<thead>
				<tr><th>Date</th><th>Amount</th><th>Method</th><th>Period</th></tr>
			</thead>
			<tbody>
				{#each data.payments as p (p.paidAt)}
					<tr>
						<td>{fmt(p.paidAt)}</td>
						<td>{p.amountEur.toFixed(2)}&nbsp;€</td>
						<td>{p.method}</td>
						<td class="muted small">{fmt(p.periodStart)} to {fmt(p.periodEnd)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<div class="card">
	<h3>Costs covered this year</h3>
	<div class="progress">
		<div style="width: {Math.min(100, (data.collectedEur / COSTS.annualEur) * 100)}%"></div>
	</div>
	<p class="muted small">
		{data.collectedEur.toFixed(2)}&nbsp;€ of {COSTS.annualEur}&nbsp;€ collected in membership fees.
		Running the mementomori.social infrastructure, websites and social media service costs
		{COSTS.monthlyEur}&nbsp;€ a month.
	</p>
</div>

<p><button class="danger" onclick={signOut}>Sign out</button></p>
