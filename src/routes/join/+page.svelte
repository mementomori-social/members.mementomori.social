<script lang="ts">
	import { enhance } from '$app/forms';
	import { FEES } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>Apply for membership</h1>

<p>
	The board reviews every application. Membership begins when the board approves it, and if an
	application is not approved, any fee already paid is refunded in full.
</p>

<form method="POST" class="stack" use:enhance>
	<label class="field">
		Full name
		<input type="text" name="fullName" required value={form?.fullName ?? ''} />
	</label>
	<label class="field">
		Home municipality
		<input
			type="text"
			name="homeMunicipality"
			required
			placeholder="e.g. Jyväskylä"
			value={form?.homeMunicipality ?? ''}
		/>
	</label>
	<p class="muted small" style="margin:0">
		Required by the Finnish Associations Act for the member register.
	</p>

	{#if !data.signedIn}
		<label class="field">
			Email
			<input type="email" name="email" required value={form?.email ?? ''} />
		</label>
		<label class="field">
			Password
			<input type="password" name="password" required minlength="8" />
		</label>
	{/if}

	<fieldset style="border:none;padding:0;margin:6px 0 0;display:grid;gap:8px">
		<label class="check">
			<input type="radio" name="memberClass" value="member" checked />
			<span
				><strong>Member</strong>, {FEES.member.year} €/year or {FEES.member.month} €/month. One vote at
				the association meeting.</span
			>
		</label>
		<label class="check">
			<input type="radio" name="memberClass" value="supporting" />
			<span
				><strong>Supporting member</strong>, {FEES.supporting.year} €/year or
				{FEES.supporting.month} €/month. Attendance and speaking rights.</span
			>
		</label>
	</fieldset>

	<fieldset style="border:none;padding:0;margin:6px 0 0;display:grid;gap:8px">
		<label class="check">
			<input type="radio" name="billingInterval" value="year" checked />
			<span
				>Pay annually <span class="muted">(preferred, less bookkeeping for the volunteers)</span
				></span
			>
		</label>
		<label class="check">
			<input type="radio" name="billingInterval" value="month" />
			<span>Pay in monthly instalments</span>
		</label>
	</fieldset>

	<label class="check">
		<input type="checkbox" name="listedConsent" />
		<span
			>Show my name on the member list. The list is not public: only signed-in, approved members can
			see it. Optional.</span
		>
	</label>

	{#if form?.error}<p class="error">{form.error}</p>{/if}

	<div><button type="submit">Submit application</button></div>

	<p class="muted small">
		After signing up you can link your mementomori.social account on the dashboard. It is optional
		and never a condition of membership.
	</p>
</form>
