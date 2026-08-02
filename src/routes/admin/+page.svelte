<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const fmt = (d: Date | string) => new Date(d).toLocaleDateString('en-GB');
</script>

<h1>Board</h1>

{#if form?.adminError}<p class="error">{form.adminError}</p>{/if}
{#if form?.refundNote}
	<p class="notice">
		Application rejected. If a fee was already paid, refund it in full (association meeting decision
		21.7.2026).
	</p>
{/if}

<h2>Open applications</h2>

{#if data.applied.length === 0}
	<p class="muted">No open applications.</p>
{:else}
	{#each data.applied as a (a.id)}
		<div class="card">
			<h3>{a.fullName} <span class="muted small">({a.homeMunicipality})</span></h3>
			<p class="muted small">
				{a.memberClass === 'member' ? 'Member' : 'Supporting member'}, pays
				{a.billingInterval === 'year' ? 'annually' : 'monthly'}, applied {fmt(a.appliedAt)}
				{#if a.mastodonAcct}, @{a.mastodonAcct}{/if}
			</p>
			<p class="small">
				Approvals so far: {a.approvals.length}
				{#if a.approvals.length > 0}
					({a.approvals.map((x) => x.approverRole).join(', ')})
				{/if}
				<span class="muted">
					- two needed, at least one chair or vice chair, not your own application</span
				>
			</p>
			<div style="display:flex;gap:10px">
				<form method="POST" action="?/approve" use:enhance>
					<input type="hidden" name="memberId" value={a.id} />
					<button type="submit">Approve</button>
				</form>
				<form method="POST" action="?/reject" use:enhance>
					<input type="hidden" name="memberId" value={a.id} />
					<button type="submit" class="danger">Reject</button>
				</form>
			</div>
		</div>
	{/each}
{/if}

<h2>Record a bank transfer</h2>

<div class="card">
	<form method="POST" action="?/recordPayment" class="stack" use:enhance>
		<label class="field">
			Member
			<select name="memberId" required>
				{#each data.roster.filter((m) => m.status === 'approved') as m (m.id)}
					<option value={m.id}>{m.fullName}</option>
				{/each}
			</select>
		</label>
		<label class="field">
			Amount (€)
			<input type="number" name="amountEur" step="0.01" min="0" required />
		</label>
		<label class="field">
			Paid on
			<input type="date" name="paidAt" required />
		</label>
		<label class="field">
			Reference <span class="muted">(bank archive id or message)</span>
			<input type="text" name="reference" />
		</label>
		<div><button type="submit" class="ghost">Record payment</button></div>
		<p class="muted small">Stripe payments appear automatically once Stripe is connected.</p>
	</form>
</div>

<h2>Ledger</h2>

{#if data.ledger.length === 0}
	<p class="muted">No payments recorded.</p>
{:else}
	<table class="list">
		<thead>
			<tr><th>Date</th><th>Member</th><th>Amount</th><th>Method</th><th>Reference</th></tr>
		</thead>
		<tbody>
			{#each data.ledger as p (p.id)}
				<tr>
					<td>{fmt(p.paidAt)}</td>
					<td>{p.memberName}</td>
					<td>{p.amountEur.toFixed(2)} €</td>
					<td class="muted">{p.method}</td>
					<td class="muted small">{p.reference ?? ''}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<h2>Member register</h2>

<p class="small">
	<a href="/admin/register.csv">Download the register (CSV)</a>
	<span class="muted">full name and home municipality as required by yhdistyslaki 11 §</span><br />
	<a href="/admin/ledger.csv">Download the ledger (CSV)</a>
	<span class="muted">for bookkeeping</span>
</p>

<h2>Decided</h2>

<table class="list">
	<thead>
		<tr><th>Name</th><th>Municipality</th><th>Class</th><th>Status</th><th>Decided</th></tr>
	</thead>
	<tbody>
		{#each data.roster as m (m.id)}
			<tr>
				<td>{m.fullName}</td>
				<td class="muted">{m.homeMunicipality}</td>
				<td class="muted small">{m.memberClass}</td>
				<td>
					<span class="badge {m.status === 'approved' ? 'ok' : ''}">{m.status}</span>
				</td>
				<td class="muted small">{m.decidedAt ? fmt(m.decidedAt) : ''}</td>
			</tr>
		{/each}
	</tbody>
</table>
