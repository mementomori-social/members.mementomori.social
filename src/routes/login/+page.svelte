<script lang="ts">
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let busy = $state(false);

	async function signInEmail(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = '';
		const res = await authClient.signIn.email({ email, password });
		busy = false;
		if (res.error) error = res.error.message ?? m.login_failed();
		else goto('/dashboard', { invalidateAll: true });
	}

	async function signInMastodon() {
		error = '';
		const res = await authClient.signIn.oauth2({
			providerId: 'mastodon',
			callbackURL: '/dashboard'
		});
		if (res.error) error = res.error.message ?? m.login_masto_failed();
	}
</script>

<h1>{m.login_heading()}</h1>

<form class="stack" onsubmit={signInEmail}>
	<label class="field">
		{m.field_email()}
		<input
			type="email"
			bind:value={email}
			required
			autocomplete="email"
			placeholder={m.ph_email()}
		/>
	</label>
	<label class="field">
		{m.field_password()}
		<input
			type="password"
			bind:value={password}
			required
			autocomplete="current-password"
			placeholder={m.ph_password()}
		/>
	</label>
	{#if error}<p class="error">{error}</p>{/if}
	<div style="display:flex;gap:10px;flex-wrap:wrap">
		<button type="submit" disabled={busy}>{m.login_submit()}</button>
		<button type="button" class="ghost" onclick={signInMastodon}>{m.login_masto()}</button>
	</div>
	<p class="muted small">
		{m.login_hint()} <a href={localizeHref('/join')}>{m.apply_cta()}</a>.
	</p>
</form>
