<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	const current = (path: string) => (page.url.pathname === path ? 'page' : undefined);
</script>

<svelte:head>
	<title>Mementomori ry members</title>
	<meta
		name="description"
		content="Membership of Mementomori ry, the non-profit behind mementomori.social"
	/>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/assets/icon-32.png" type="image/png" />
	<meta name="color-scheme" content="dark" />
</svelte:head>

<a class="skip-link" href="#content">Skip to content</a>

<div class="wrap">
	<header class="site">
		<a class="brand" href="/">
			<img src="/assets/logo.svg" alt="" width="26" height="34" />
			Mementomori ry
		</a>
		<nav aria-label="Main">
			<a href="/" aria-current={current('/')}>Overview</a>
			{#if data.member}
				<a href="/members" aria-current={current('/members')}>Members</a>
				<a href="/dashboard" aria-current={current('/dashboard')}>Dashboard</a>
			{:else}
				<a href="/join" aria-current={current('/join')}>Join</a>
			{/if}
			{#if data.board}
				<a href="/admin" aria-current={current('/admin')}>Board</a>
			{/if}
			{#if data.user}
				<a href="/dashboard">{data.user.name}</a>
			{:else}
				<a href="/login" aria-current={current('/login')}>Sign in</a>
			{/if}
		</nav>
	</header>
	<main id="content">
		{@render children()}
	</main>
</div>
