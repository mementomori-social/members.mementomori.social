<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let error = $state(page.url.searchParams.get('oauth') === 'failed' ? 'oauth_failed' : '');
	let sent = $state(false);
	let busy = $state(false);

	async function sendMagicLink(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = '';
		const res = await authClient.signIn.magicLink({
			email,
			callbackURL: localizeHref('/dashboard')
		});
		busy = false;
		if (res.error) error = res.error.message ?? m.login_failed();
		else sent = true;
	}

	async function signInMastodon() {
		error = '';
		const res = await authClient.signIn.oauth2({
			providerId: 'mastodon',
			callbackURL: localizeHref('/dashboard'),
			errorCallbackURL: localizeHref('/login?oauth=failed')
		});
		if (res.error) error = res.error.message ?? m.login_masto_failed();
	}
</script>

<h1>{m.login_heading()}</h1>

{#if sent}
	<p class="notice ok" role="status">✓ {m.magic_sent()}</p>
{:else}
	<div class="tiers">
		<div class="tier">
			<h3>{m.login_masto_heading()}</h3>
			<p class="muted small">
				{m.login_hint()}
				<a class="plain-link" href={localizeHref('/join')}>{m.apply_cta()}</a>.
			</p>
			<button type="button" onclick={signInMastodon}>
				<img class="btn-icon" src="/assets/mastodon.svg" alt="" />{m.login_masto()}</button
			>
		</div>
		<div class="tier">
			<h3>{m.login_email_heading()}</h3>
			<p class="muted small">{m.login_magic_note()}</p>
			<form class="stack" onsubmit={sendMagicLink}>
				<div class="input-group">
					<input
						id="login-email"
						aria-label={m.field_email()}
						type="email"
						bind:value={email}
						required
						autocomplete="email"
						placeholder={m.ph_email()}
					/>
					<button type="submit" disabled={busy}>{m.login_submit()}</button>
				</div>
			</form>
		</div>
	</div>
	{#if error}
		<p class="error">{error === 'oauth_failed' ? m.login_masto_not_linked() : error}</p>
	{/if}
{/if}
