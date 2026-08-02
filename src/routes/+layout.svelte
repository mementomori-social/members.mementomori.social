<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const pathname = $derived(String(page.url.pathname));
	const locale = $derived(pathname === '/fi' || pathname.startsWith('/fi/') ? 'fi' : 'en');
	const delocalized = $derived(locale === 'fi' ? pathname.slice(3) || '/' : pathname);
	const current = (path: string) => (delocalized === path ? 'page' : undefined);
	const href = (path: string) => localizeHref(path);
</script>

<svelte:head>
	<title>{m.site_title()}</title>
	<meta name="description" content={m.site_description()} />
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/assets/icon-32.png" type="image/png" />
	<meta name="color-scheme" content="dark" />
	<link rel="alternate" hreflang="en" href={localizeHref(delocalized, { locale: 'en' })} />
	<link rel="alternate" hreflang="fi" href={localizeHref(delocalized, { locale: 'fi' })} />
</svelte:head>

<a class="skip-link" href="#content">{m.skip_to_content()}</a>

<div class="wrap">
	<header class="site">
		<a class="brand" href={href('/')}>
			<img src="/assets/logo.svg" alt="" width="26" height="34" />
			Mementomori ry
		</a>
		<nav aria-label="Main">
			<a href={href('/')} aria-current={current('/')}>{m.nav_overview()}</a>
			{#if data.member}
				<a href={href('/members')} aria-current={current('/members')}>{m.nav_members()}</a>
				<a href={href('/dashboard')} aria-current={current('/dashboard')}>{m.nav_dashboard()}</a>
			{:else}
				<a href={href('/join')} aria-current={current('/join')}>{m.nav_join()}</a>
			{/if}
			{#if data.board}
				<a href={href('/admin')} aria-current={current('/admin')}>{m.nav_board()}</a>
			{/if}
			{#if data.user}
				<a href={href('/dashboard')}>{data.user.name}</a>
			{:else}
				<a href={href('/login')} aria-current={current('/login')}>{m.nav_sign_in()}</a>
			{/if}
		</nav>
		<nav class="lang" aria-label={m.language_label()}>
			<a
				href={localizeHref(delocalized, { locale: 'en' })}
				hreflang="en"
				lang="en"
				aria-current={locale === 'en' ? 'true' : undefined}>English</a
			>
			<a
				href={localizeHref(delocalized, { locale: 'fi' })}
				hreflang="fi"
				lang="fi"
				aria-current={locale === 'fi' ? 'true' : undefined}>Suomi</a
			>
		</nav>
	</header>
	<main id="content">
		{@render children()}
	</main>
</div>
