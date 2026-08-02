<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let error = $state('');
	let sent = $state(false);
	let busy = $state(false);

	async function sendMagicLink(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = '';
		const res = await authClient.signIn.magicLink({ email, callbackURL: '/dashboard' });
		busy = false;
		if (res.error) error = res.error.message ?? m.login_failed();
		else sent = true;
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

<p class="muted">{m.login_hint_magic()}</p>

{#if sent}
	<p class="notice">{m.magic_sent()}</p>
{:else}
	<form class="stack" onsubmit={sendMagicLink}>
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
		{#if error}<p class="error">{error}</p>{/if}
		<div class="or-row">
			<button type="submit" disabled={busy}>{m.login_magic()}</button>
			<span class="or" aria-hidden="true">{m.or_sep()}</span>
			<button type="button" class="ghost" onclick={signInMastodon}>
				<img class="btn-icon" src="/assets/mastodon.svg" alt="" />{m.login_masto()}</button
			>
		</div>
	</form>
	<p class="muted small">
		{m.login_hint()} <a href={localizeHref('/join')}>{m.apply_cta()}</a>.
	</p>
{/if}
