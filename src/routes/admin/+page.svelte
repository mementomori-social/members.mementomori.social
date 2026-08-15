<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const finnishDatePattern = '\\d{1,2}\\.\\d{1,2}\\.\\d{4}';
	const fmt = (d: Date | string) => new Date(d).toLocaleDateString('fi-FI');
	const statusLabel = (s: string) =>
		({
			applied: m.status_applied(),
			approved: m.status_approved(),
			rejected: m.status_rejected(),
			ended: m.status_ended()
		})[s] ?? s;
</script>

<h1>{m.admin_heading()}</h1>

{#if form?.adminError}<p class="error">{form.adminError}</p>{/if}
{#if form?.refundNote}
	<p class="notice">{m.admin_reject_note()}</p>
{/if}

<h2>{m.admin_open_apps()}</h2>

{#if data.applied.length === 0}
	<p class="muted">{m.admin_no_open()}</p>
{:else}
	{#each data.applied as a (a.id)}
		<div class="card">
			<h3>{a.fullName} <span class="muted small">({a.homeMunicipality})</span></h3>
			<p class="muted small">
				{a.memberClass === 'member' ? m.class_member() : m.class_patron()},
				{a.billingInterval === 'year' ? m.pays_annually() : m.pays_monthly()},
				{m.admin_applied()}
				{fmt(a.appliedAt)}
				{#if a.mastodonAcct}, @{a.mastodonAcct}{/if}
				{#if a.matrixId}, Matrix: {a.matrixId}{/if}
			</p>
			<p class="small">
				{m.admin_approvals_so_far()}
				{a.approvals.length}
				{#if a.approvals.length > 0}
					({a.approvals.map((x) => x.approverRole).join(', ')})
				{/if}
				<span class="muted"> - {m.admin_approval_rule()}</span>
			</p>
			<div style="display:flex;gap:10px">
				<form method="POST" action="?/approve" use:enhance>
					<input type="hidden" name="memberId" value={a.id} />
					<button type="submit">{m.admin_approve()}</button>
				</form>
				<form method="POST" action="?/reject" use:enhance>
					<input type="hidden" name="memberId" value={a.id} />
					<button type="submit" class="danger">{m.admin_reject()}</button>
				</form>
			</div>
		</div>
	{/each}
{/if}

<h2>{m.admin_record_bank()}</h2>

<div class="card">
	<form method="POST" action="?/recordPayment" class="stack" use:enhance>
		<label class="field">
			{m.admin_member()}
			<select name="memberId" required>
				{#each data.roster.filter((r) => r.status === 'approved') as r (r.id)}
					<option value={r.id}>{r.fullName}</option>
				{/each}
			</select>
		</label>
		<label class="field">
			{m.admin_amount()}
			<input type="number" name="amountEur" step="0.01" min="0" required placeholder="60.00" />
		</label>
		<label class="field">
			{m.admin_paid_on()}
			<input
				type="text"
				name="paidAt"
				required
				placeholder="15.8.2026"
				pattern={finnishDatePattern}
				inputmode="numeric"
			/>
		</label>
		<label class="field">
			{m.admin_reference()} <span class="muted">{m.admin_reference_hint()}</span>
			<input type="text" name="reference" />
		</label>
		<div><button type="submit" class="ghost">{m.admin_record_payment()}</button></div>
		<p class="muted small">{m.admin_stripe_auto()}</p>
	</form>
</div>

<h2>{m.admin_ledger()}</h2>

{#if data.ledger.length === 0}
	<p class="muted">{m.admin_no_payments()}</p>
{:else}
	<table class="list">
		<thead>
			<tr
				><th>{m.th_date()}</th><th>{m.admin_member()}</th><th>{m.th_amount()}</th><th
					>{m.th_method()}</th
				><th>{m.admin_reference()}</th></tr
			>
		</thead>
		<tbody>
			{#each data.ledger as p (p.id)}
				<tr>
					<td>{fmt(p.paidAt)}</td>
					<td>{p.memberName}</td>
					<td>{p.amountEur.toFixed(2)}&nbsp;€</td>
					<td class="muted">{p.method === 'bank' ? m.method_bank() : m.method_stripe()}</td>
					<td class="muted small">{p.reference ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<h2>{m.admin_income()}</h2>

<p class="muted small">{m.admin_income_note()}</p>

<div class="card">
	<form method="POST" action="?/recordIncome" class="stack" use:enhance>
		<label class="field">
			{m.admin_income_source()}
			<select name="source" required>
				<option value="sponsorship">{m.income_sponsorship()}</option>
				<option value="grant">{m.income_grant()}</option>
				<option value="other">{m.income_other()}</option>
			</select>
		</label>
		<label class="field">
			{m.admin_income_payer()}
			<input type="text" name="payer" required placeholder="Digitoimisto Dude Oy" />
		</label>
		<label class="field">
			{m.admin_amount()}
			<input type="number" name="amountEur" step="0.01" min="0" required placeholder="200.00" />
		</label>
		<label class="field">
			{m.admin_paid_on()}
			<input
				type="text"
				name="paidAt"
				required
				placeholder="15.8.2026"
				pattern={finnishDatePattern}
				inputmode="numeric"
			/>
		</label>
		<label class="field">
			{m.admin_income_note_field()}
			<input type="text" name="note" placeholder={m.ph_income_note()} />
		</label>
		<div><button type="submit" class="ghost">{m.admin_record_income()}</button></div>
		{#if form?.incomeError}<p class="error">{form.incomeError}</p>{/if}
	</form>
</div>

{#if data.incomeRows.length > 0}
	<table class="list">
		<thead>
			<tr
				><th>{m.th_date()}</th><th>{m.admin_income_payer()}</th><th>{m.th_amount()}</th><th
					>{m.admin_income_source()}</th
				></tr
			>
		</thead>
		<tbody>
			{#each data.incomeRows as r (r.id)}
				<tr>
					<td>{fmt(r.paidAt)}</td>
					<td>{r.payer}</td>
					<td>{r.amountEur.toFixed(2)}&nbsp;€</td>
					<td class="muted"
						>{r.source === 'sponsorship'
							? m.income_sponsorship()
							: r.source === 'grant'
								? m.income_grant()
								: m.income_other()}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<h2>{m.admin_register()}</h2>

<p class="small">
	<a href="/admin/register.csv">{m.admin_dl_register()}</a>
	<span class="muted">{m.admin_dl_register_note()}</span><br />
	<a href="/admin/ledger.csv">{m.admin_dl_ledger()}</a>
	<span class="muted">{m.admin_dl_ledger_note()}</span>
</p>

<h2>{m.admin_decided()}</h2>

<table class="list">
	<thead>
		<tr
			><th>{m.th_name()}</th><th>{m.th_municipality()}</th><th>{m.th_class()}</th><th
				>{m.th_status()}</th
			><th>{m.th_matrix()}</th><th>{m.th_decided()}</th></tr
		>
	</thead>
	<tbody>
		{#each data.roster as r (r.id)}
			<tr>
				<td>{r.fullName}</td>
				<td class="muted">{r.homeMunicipality}</td>
				<td class="muted small"
					>{r.memberClass === 'member' ? m.class_member() : m.class_patron()}</td
				>
				<td>
					<span class="badge {r.status === 'approved' ? 'ok' : ''}">{statusLabel(r.status)}</span>
				</td>
				<td class="muted small">{r.matrixId ?? ''}</td>
				<td class="muted small">{r.decidedAt ? fmt(r.decidedAt) : ''}</td>
			</tr>
		{/each}
	</tbody>
</table>
