<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { m } from '$lib/paraglide/messages.js';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { authClient } from '$lib/auth-client';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	async function signOut() {
		await authClient.signOut();
		await goto('/', { invalidateAll: true });
	}

	const pathname = $derived(String(page.url.pathname));
	const locale = $derived(pathname === '/fi' || pathname.startsWith('/fi/') ? 'fi' : 'en');
	const delocalized = $derived(locale === 'fi' ? pathname.slice(3) || '/' : pathname);
	const current = (path: string) => (delocalized === path ? 'page' : undefined);
	const href = (path: string) => localizeHref(path);

	/** Each locale names itself in its own language. Falls back to the native
	    language name for locales added later. */
	const localeLabels: Record<string, string> = {
		en: 'In English',
		fi: 'Suomeksi'
	};
	const localeName = (l: string) => {
		if (localeLabels[l]) return localeLabels[l];
		const name = new Intl.DisplayNames([l], { type: 'language' }).of(l) ?? l;
		return name.charAt(0).toLocaleUpperCase(l) + name.slice(1);
	};

	/** Per-page metadata, localized. Pages not listed fall back to the site name. */
	const pageMeta = $derived.by((): { title: string | null; description: string } => {
		const metas: Record<string, { title: () => string; description: () => string }> = {
			'/join': { title: m.join_heading, description: m.join_intro },
			'/sponsorship': { title: m.sponsor_heading, description: m.sponsor_intro },
			'/contact': { title: m.contact_heading, description: m.contact_intro },
			'/safer-space': { title: m.safer_heading, description: m.safer_intro },
			'/privacy': { title: m.privacy_heading, description: m.privacy_intro },
			'/login': { title: m.login_heading, description: m.login_hint_magic },
			'/members': { title: m.members_heading, description: m.members_note },
			'/dashboard': { title: m.dash_heading, description: m.site_description },
			'/matrix': { title: m.matrix_heading, description: m.matrix_intro },
			'/admin': { title: m.admin_heading, description: m.site_description }
		};
		const entry = metas[delocalized];
		return entry
			? { title: entry.title(), description: entry.description() }
			: { title: null, description: m.site_description() };
	});
	const pageTitle = $derived(
		pageMeta.title ? `${pageMeta.title} - Mementomori ry` : 'Mementomori ry'
	);

	/** Full page load on purpose: Paraglide resolves the locale at render time. */
	function switchLocale(e: Event) {
		const target = (e.currentTarget as HTMLSelectElement).value as 'en' | 'fi';
		window.location.href = localizeHref(delocalized, { locale: target });
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageMeta.description} />
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/assets/icon-32.png" type="image/png" />
	<meta name="color-scheme" content="dark" />
	<link rel="alternate" hreflang="en" href={localizeHref(delocalized, { locale: 'en' })} />
	<link rel="alternate" hreflang="fi" href={localizeHref(delocalized, { locale: 'fi' })} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Mementomori ry" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageMeta.description} />
	<meta property="og:url" content={page.url.origin + pathname} />
	<meta property="og:locale" content={locale === 'fi' ? 'fi_FI' : 'en_US'} />
	<meta property="og:image" content="{page.url.origin}/assets/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Mementomori ry" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<a class="skip-link" href="#content">{m.skip_to_content()}</a>

<div class="wrap">
	<div class="utility">
		{#if data.user}
			<span class="signed-in-as">
				<span class="muted">{m.signed_in_as()}</span>
				<a href={href('/dashboard')}>{data.user.name}</a>
			</span>
			{#if data.board}
				<a class="utility-btn" href={href('/admin')} aria-current={current('/admin')}
					>{m.nav_board()}</a
				>
			{/if}
			<button class="utility-btn leave" onclick={signOut}>{m.sign_out()}</button>
		{:else}
			<a href={href('/join')} aria-current={current('/join')}>
				<span class="wide">{m.nav_join()}</span><span class="narrow">{m.nav_join_short()}</span>
			</a>
			<a class="utility-btn enter" href={href('/login')} aria-current={current('/login')}>
				<span class="wide">{m.nav_sign_in()}</span><span class="narrow"
					>{m.nav_sign_in_short()}</span
				>
			</a>
		{/if}
		<label class="lang-select">
			<span class="visually-hidden">{m.language_label()}</span>
			<svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7" />
				<ellipse cx="12" cy="12" rx="4.2" ry="10" stroke="currentColor" stroke-width="1.7" />
				<path d="M2.5 8.5h19M2.5 15.5h19" stroke="currentColor" stroke-width="1.7" />
			</svg>
			<span class="lang-code" aria-hidden="true">{locale.toUpperCase()}</span>
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
			{#if data.user}
				<a href={href('/dashboard')} aria-current={current('/dashboard')}>{m.nav_dashboard()}</a>
				{#if data.member}
					<a href={href('/members')} aria-current={current('/members')}>{m.nav_members()}</a>
				{/if}
				<a href={href('/contact')} aria-current={current('/contact')}>{m.nav_contact()}</a>
			{:else}
				<a href={href('/')} aria-current={current('/')}>{m.nav_overview()}</a>
				<a href={href('/sponsorship')} aria-current={current('/sponsorship')}
					>{m.sponsor_heading()}</a
				>
				<a href={href('/contact')} aria-current={current('/contact')}>{m.nav_contact()}</a>
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
				<a href={href('/safer-space')}>{m.nav_safer_space()}</a>
				<a href={href('/privacy')}>{m.nav_privacy()}</a>
				<a href={href('/contact')}>{m.nav_contact()}</a>
			</span>
			<span class="icons">
				<a href="https://mementomori.social/@ry" rel="me" aria-label="Mastodon">
					<svg
						viewBox="0 0 216.4144 232.00976"
						width="22"
						height="22"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M211.80734 139.0875c-3.18125 16.36625-28.4925 34.2775-57.5625 37.74875-15.15875 1.80875-30.08375 3.47125-45.99875 2.74125-26.0275-1.1925-46.565-6.2125-46.565-6.2125 0 2.53375.15625 4.94625.46875 7.2025 3.38375 25.68625 25.47 27.225 46.39125 27.9425 21.11625.7225 39.91875-5.20625 39.91875-5.20625l.8675 19.09s-14.77 7.93125-41.08125 9.39c-14.50875.7975-32.52375-.365-53.50625-5.91875C9.23234 213.82 1.40609 165.31125.20859 116.09125c-.365-14.61375-.14-28.39375-.14-39.91875 0-50.33 32.97625-65.0825 32.97625-65.0825C49.67234 3.45375 78.20359.2425 107.86484 0h.72875c29.66125.2425 58.21125 3.45375 74.8375 11.09 0 0 32.975 14.7525 32.975 65.0825 0 0 .41375 37.13375-4.59875 62.915 M177.50984 80.077v60.94125h-24.14375v-59.15c0-12.46875-5.24625-18.7975-15.74-18.7975-11.6025 0-17.4175 7.5075-17.4175 22.3525v32.37625H96.20734V85.42325c0-14.845-5.81625-22.3525-17.41875-22.3525-10.49375 0-15.74 6.32875-15.74 18.7975v59.15H38.90484V80.077c0-12.455 3.17125-22.3525 9.54125-29.675 6.56875-7.3225 15.17125-11.07625 25.85-11.07625 12.355 0 21.71125 4.74875 27.8975 14.2475l6.01375 10.08125 6.015-10.08125c6.185-9.49875 15.54125-14.2475 27.8975-14.2475 10.6775 0 19.28 3.75375 25.85 11.07625 6.36875 7.3225 9.54 17.22 9.54 29.675"
						/>
					</svg>
				</a>
				<a href="https://github.com/mementomori-social" aria-label="GitHub">
					<svg viewBox="0 0 16 16" width="22" height="22" fill="currentColor" aria-hidden="true">
						<path
							d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
						/>
					</svg>
				</a>
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
