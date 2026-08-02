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

{#if sent}
	<p class="notice">{m.magic_sent()}</p>
{:else}
	<div class="tiers">
		<div class="tier">
			<h3>{m.login_email_heading()}</h3>
			<p class="muted small">{m.login_magic_note()}</p>
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
				<div><button type="submit" disabled={busy}>{m.login_submit()}</button></div>
			</form>
		</div>
		<div class="tier">
			<h3>{m.login_masto_heading()}</h3>
			<p class="muted small">
				{m.login_hint()} <a href={localizeHref('/join')}>{m.apply_cta()}</a>.
			</p>
			<button type="button" class="ghost" onclick={signInMastodon}>
				<img class="btn-icon" src="/assets/mastodon.svg" alt="" />{m.login_masto()}</button
			>
		</div>
	</div>
	{#if error}<p class="error">{error}</p>{/if}
{/if}
