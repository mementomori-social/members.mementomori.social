<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	const message = $derived(page.error?.message ?? '');
</script>

<h1 class="error-heading">{m.error_heading({ message })}</h1>

<p>{m.error_code_note({ status: page.status })}</p>

<p>
	<a href={localizeHref('/')}>{m.nav_overview()}</a>
</p>

<style>
	.error-heading {
		color: var(--danger);
	}
</style>
