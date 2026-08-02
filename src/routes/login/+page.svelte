<script lang="ts">
	import { goto } from '$app/navigation';
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
		if (res.error) error = res.error.message ?? 'Sign-in failed.';
		else goto('/dashboard', { invalidateAll: true });
	}

	async function signInMastodon() {
		error = '';
		const res = await authClient.signIn.oauth2({
			providerId: 'mastodon',
			callbackURL: '/dashboard'
		});
		if (res.error) error = res.error.message ?? 'Mastodon sign-in failed.';
	}
</script>

<h1>Sign in</h1>

<form class="stack" onsubmit={signInEmail}>
	<label class="field">
		Email
		<input
			type="email"
			bind:value={email}
			required
			autocomplete="email"
			placeholder="name@example.com"
		/>
	</label>
	<label class="field">
		Password
		<input type="password" bind:value={password} required autocomplete="current-password" />
	</label>
	{#if error}<p class="error">{error}</p>{/if}
	<div style="display:flex;gap:10px;flex-wrap:wrap">
		<button type="submit" disabled={busy}>Sign in</button>
		<button type="button" class="ghost" onclick={signInMastodon}>
			Sign in with mementomori.social
		</button>
	</div>
	<p class="muted small">
		Mastodon sign-in works once you have linked your mementomori.social account on the dashboard.
		New here? <a href="/join">Apply for membership</a>.
	</p>
</form>
