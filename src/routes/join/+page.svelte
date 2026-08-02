<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { FEES } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const chosePlain = $derived(page.url.searchParams.get('path') === 'form');
	const showForm = $derived(Boolean(data.pendingMasto) || chosePlain || data.signedIn);
</script>

<h1>Apply for membership</h1>

{#if !showForm}
	<p>
		The board reviews every application. Membership begins when the board approves it, and if an
		application is not approved, any fee already paid is refunded in full.
	</p>

	<div class="tiers">
		<div class="tier">
			<h3>I have a mementomori.social account</h3>
			<p class="muted small">
				Verify your account first. Your name gets prefilled, your avatar shows on the member list,
				and you sign in with Mastodon from then on. No password needed.
			</p>
			<a class="button" href="/join/mastodon">Continue with mementomori.social</a>
		</div>
		<div class="tier">
			<h3>I don't want to link an account</h3>
			<p class="muted small">
				Fill in the application form and sign in with an email address and password. You can still
				link a Mastodon account later on the dashboard.
			</p>
			<a class="button ghost" href="/join?path=form">Continue with the form</a>
		</div>
	</div>
{:else}
	{#if data.pendingMasto}
		<p class="notice">
			Verified as <strong>@{data.pendingMasto.acct}</strong> on mementomori.social. Finish the application
			below, no password needed.
		</p>
	{/if}

	<form method="POST" class="stack" use:enhance>
		<label class="field">
			Full name
			<input
				type="text"
				name="fullName"
				required
				placeholder="Firstname Lastname"
				value={form?.fullName ?? data.pendingMasto?.name ?? ''}
			/>
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
				<input
					type="email"
					name="email"
					required
					placeholder="name@example.com"
					value={form?.email ?? ''}
				/>
			</label>
			{#if data.pendingMasto}
				<p class="muted small" style="margin:0">
					Mastodon does not share your email address, and the association needs one for official
					communication.
				</p>
			{:else}
				<label class="field">
					Password
					<input type="password" name="password" required minlength="8" />
				</label>
			{/if}
		{/if}

		<fieldset style="border:none;padding:0;margin:6px 0 0;display:grid;gap:8px">
			<label class="check">
				<input type="radio" name="memberClass" value="member" checked />
				<span
					><strong>Member</strong>, {FEES.member.year}&nbsp;€/year or {FEES.member
						.month}&nbsp;€/month. Right to vote at the association meeting.</span
				>
			</label>
			<label class="check">
				<input type="radio" name="memberClass" value="supporting" />
				<span
					><strong>Patron</strong>, {FEES.supporting.year}&nbsp;€/year or
					{FEES.supporting.month}&nbsp;€/month. For organisations and for anyone who wants to
					contribute more. Attendance and speaking rights, no vote.</span
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
				>Show my name on the member list. The list is not public: only signed-in, approved members
				can see it. Optional.</span
			>
		</label>

		{#if form?.error}<p class="error">{form.error}</p>{/if}

		<div><button type="submit">Submit application</button></div>

		<p class="muted small">
			The board reviews every application. If it is not approved, any fee already paid is refunded
			in full.
		</p>
	</form>
{/if}
