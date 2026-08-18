<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import TableScroll from '$lib/components/TableScroll.svelte';
	import CopyField from '$lib/components/CopyField.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const mem = $derived(data.member);

	const fmt = (d: Date | string) => new Date(d).toLocaleDateString('fi-FI');
	const statusLabel = (s: string) =>
		({
			applied: m.status_applied(),
			approved: m.status_approved(),
			rejected: m.status_rejected(),
			ended: m.status_ended()
		})[s] ?? s;
	const yn = (v: boolean) => (v ? `✓ ${m.detail_yes()}` : `✗ ${m.detail_no()}`);
</script>

<h1>{m.detail_heading()}</h1>

<p class="small"><a href="/admin">{m.detail_back()}</a></p>

<div class="dash-grid">
	<div class="card">
		<h3>{mem.fullName}</h3>
		<table class="list detail-table">
			<tbody>
				<tr
					><td class="muted">{m.th_member_number()}</td><td class="copy-fit"
						>{#if mem.memberNumber}<CopyField display={String(mem.memberNumber)} />{:else}<span
								class="muted">–</span
							>{/if}</td
					></tr
				>
				<tr><td class="muted">{m.field_display_name()}</td><td>{mem.displayName ?? '–'}</td></tr>
				<tr><td class="muted">{m.field_municipality()}</td><td>{mem.homeMunicipality}</td></tr>
				<tr
					><td class="muted">{m.field_email()}</td><td
						>{#if mem.email}<a class="with-icon" href="mailto:{mem.email}"
								><span class="ui-icon mail"></span>{mem.email}</a
							>{:else}<span class="mono-note">{m.not_saved()}</span>{/if}</td
					></tr
				>
				<tr
					><td class="muted">{m.card_masto()}</td><td
						>{#if mem.mastodonAcct}<a
								class="with-icon"
								href="https://mementomori.social/@{mem.mastodonAcct}"
								><span class="ui-icon masto"></span>@{mem.mastodonAcct}@mementomori.social</a
							>{:else}<span class="mono-note">{m.not_saved()}</span>{/if}</td
					></tr
				>
				<tr
					><td class="muted">{m.th_class()}</td><td
						>{mem.memberClass === 'member' ? m.class_member() : m.class_patron()}</td
					></tr
				>
				<tr
					><td class="muted">{m.th_status()}</td><td>
						<span class="status-text {mem.status}">{statusLabel(mem.status)}</span>
					</td></tr
				>
				<tr
					><td class="muted">{m.billing_heading()}</td><td
						>{mem.billingInterval === 'year' ? m.pays_annually() : m.pays_monthly()}</td
					></tr
				>
				<tr><td class="muted">{m.detail_applied_on()}</td><td>{fmt(mem.appliedAt)}</td></tr>
				<tr
					><td class="muted">{m.detail_decided_on()}</td><td
						>{mem.decidedAt ? fmt(mem.decidedAt) : '–'}</td
					></tr
				>
			</tbody>
		</table>
	</div>

	<div class="card">
		<h3>{m.visibility_heading()}</h3>
		<table class="list detail-table">
			<tbody>
				<tr
					><td class="muted">{m.detail_consent_members()}</td><td
						class={mem.listedConsent ? 'ok-note' : 'muted'}>{yn(mem.listedConsent)}</td
					></tr
				>
				<tr
					><td class="muted">{m.detail_consent_public()}</td><td
						class={mem.publicConsent ? 'ok-note' : 'muted'}>{yn(mem.publicConsent)}</td
					></tr
				>
			</tbody>
		</table>

		<h3 style="margin-top:1.4em">{m.th_matrix()}</h3>
		{#if mem.matrixId}
			<div class="copy-fit"><CopyField display={mem.matrixId} /></div>
		{:else}
			<p class="mono-note">{m.not_saved()}</p>
		{/if}

		<h3 style="margin-top:1.4em">{m.bank_reference()}</h3>
		{#if mem.viite}
			<div class="copy-fit"><CopyField display={mem.viite} /></div>
		{:else}
			<p class="mono-note">{m.not_saved()}</p>
		{/if}

		<h3 style="margin-top:1.4em">{m.detail_stripe_sub()}</h3>
		<p class="mono-note mono-wrap">
			{mem.stripeSubscriptionId ?? m.not_saved()}{#if mem.stripeCustomerId}<br
				/>{mem.stripeCustomerId}{/if}
		</p>
	</div>

	<div class="card span2">
		<h3>{m.payment_history()}</h3>
		{#if data.payments.length === 0}
			<p class="muted small">{m.detail_no_payments()}</p>
		{:else}
			<TableScroll>
				<table class="list">
					<thead>
						<tr
							><th>{m.th_date()}</th><th>{m.th_amount()}</th><th>{m.th_method()}</th><th
								>{m.th_period()}</th
							></tr
						>
					</thead>
					<tbody>
						{#each data.payments as p (p.id)}
							<tr>
								<td>{fmt(p.paidAt)}</td>
								<td>{p.amountEur.toFixed(2)}&nbsp;€</td>
								<td class="muted">{p.method === 'bank' ? m.method_bank() : m.method_stripe()}</td>
								<td class="muted small">{fmt(p.periodStart)} {m.period_to()} {fmt(p.periodEnd)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</TableScroll>
		{/if}

		<h3 style="margin-top:1.4em">{m.detail_approvals()}</h3>
		{#if data.approvals.length === 0}
			<p class="muted small">{m.detail_no_approvals()}</p>
		{:else}
			<ul>
				{#each data.approvals as a (a.at)}
					<li class="small">{a.name} ({a.role}) · {fmt(a.at)}</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
