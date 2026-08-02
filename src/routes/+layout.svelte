<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	const pathname = $derived(String(page.url.pathname));
	const locale = $derived(pathname === '/fi' || pathname.startsWith('/fi/') ? 'fi' : 'en');
	const delocalized = $derived(locale === 'fi' ? pathname.slice(3) || '/' : pathname);
	const current = (path: string) => (delocalized === path ? 'page' : undefined);
	const href = (path: string) => localizeHref(path);

	/** Native name of a locale, capitalised: works for any future locale. */
	const localeName = (l: string) => {
		const name = new Intl.DisplayNames([l], { type: 'language' }).of(l) ?? l;
		return name.charAt(0).toLocaleUpperCase(l) + name.slice(1);
	};

	/** Full page load on purpose: Paraglide resolves the locale at render time. */
	function switchLocale(e: Event) {
		const target = (e.currentTarget as HTMLSelectElement).value as 'en' | 'fi';
		window.location.href = localizeHref(delocalized, { locale: target });
	}
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
	<div class="utility">
		{#if data.user}
			<a href={href('/dashboard')}>{data.user.name}</a>
		{:else}
			<a href={href('/login')} aria-current={current('/login')}>{m.nav_sign_in()}</a>
		{/if}
		<label class="lang-select">
			<span class="visually-hidden">{m.language_label()}</span>
			<select onchange={switchLocale} value={locale}>
				{#each locales as l (l)}
					<option value={l} lang={l}>{localeName(l)}</option>
				{/each}
			</select>
		</label>
	</div>
	<header class="site">
		<a class="brand" href={href('/')}>
			<img src="/assets/logo.svg" alt="" width="26" height="34" />
			Mementomori ry
		</a>
		<nav aria-label="Main">
			<a href={href('/')} aria-current={current('/')}>{m.nav_overview()}</a>
			<a href={href('/sponsorship')} aria-current={current('/sponsorship')}>{m.sponsor_heading()}</a
			>
			{#if data.member}
				<a href={href('/members')} aria-current={current('/members')}>{m.nav_members()}</a>
				<a href={href('/dashboard')} aria-current={current('/dashboard')}>{m.nav_dashboard()}</a>
			{:else}
				<a href={href('/join')} aria-current={current('/join')}>{m.nav_join()}</a>
			{/if}
			{#if data.board}
				<a href={href('/admin')} aria-current={current('/admin')}>{m.nav_board()}</a>
			{/if}
		</nav>
	</header>
	<main id="content">
		{@render children()}
	</main>
	<footer class="site">
		<nav aria-label={m.footer_links()}>
			<span class="group">
				<a href={href('/')}>{m.nav_overview()}</a>
				<a href={href('/join')}>{m.nav_join()}</a>
				<a href={href('/sponsorship')}>{m.sponsor_heading()}</a>
				<a href={href('/contact')}>{m.nav_contact()}</a>
				<a href={href('/safer-space')}>{m.nav_safer_space()}</a>
			</span>
			<span class="group external">
				<a href="https://mementomori.social" rel="me">mementomori.social</a>
				<a href="https://help.mementomori.social">help.mementomori.social</a>
				<a href="https://github.com/mementomori-social">GitHub</a>
			</span>
		</nav>
		<div class="meta">
			<span>
				<a href="https://github.com/mementomori-social/members.mementomori.social"
					>{m.footer_open_source()}</a
				>
				- {m.footer_version()}
				<a
					href="https://github.com/mementomori-social/members.mementomori.social/releases/tag/v{__VERSION__}"
					>{__VERSION__}</a
				>
				<a
					href="https://github.com/mementomori-social/members.mementomori.social/commit/{__COMMIT__}"
					><code>{__COMMIT__}</code></a
				>
			</span>
			<span>{m.footer_tagline()}</span>
		</div>
	</footer>
</div>
