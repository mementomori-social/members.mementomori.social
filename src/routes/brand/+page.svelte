<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { fileSize } from '$lib/format';
	import CopyField from '$lib/components/CopyField.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const COLOURS = [
		{ name: () => m.brand_colour_bg(), hex: '#0b0b0c' },
		{ name: () => m.brand_colour_surface(), hex: '#17171a' },
		{ name: () => m.brand_colour_text(), hex: '#e4e1da' },
		{ name: () => m.brand_colour_accent(), hex: '#585aff' },
		{ name: () => m.brand_colour_accent_btn(), hex: '#4143c7' },
		{ name: () => m.brand_colour_ok(), hex: '#4cd699' },
		{ name: () => m.brand_colour_warn(), hex: '#e8c547' },
		{ name: () => m.brand_colour_danger(), hex: '#ff8a8e' }
	];
</script>

<h1>{m.brand_heading()}</h1>
<p class="brand-lede">{m.brand_intro()}</p>

<a class="doc-dl brand-kit" href="/brand/mementomori-ry-brand-kit.zip">
	<span class="zip-mark" aria-hidden="true">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
			<path d="M4 7.5 12 3.5l8 4v9L12 20.5l-8-4Z" stroke-linejoin="round" />
			<path d="M12 3.5v17M4 7.5l8 4 8-4" stroke-linejoin="round" />
		</svg>
	</span>
	<span class="doc-dl-text">
		{m.brand_kit_cta()}
		<span class="muted small">ZIP, {fileSize(data.kitSize)}</span>
	</span>
</a>

<h2>{m.brand_logo_heading()}</h2>
<p class="muted">{m.brand_logo_note()}</p>

<div class="brand-grid">
	<figure class="brand-tile">
		<div class="brand-canvas dark">
			<img src="/brand/mementomori-ry-logo-on-dark.png" alt={m.brand_logo_dark()} />
		</div>
		<figcaption>{m.brand_logo_dark()}</figcaption>
	</figure>
	<figure class="brand-tile">
		<div class="brand-canvas light">
			<img src="/brand/mementomori-ry-logo-on-light.png" alt={m.brand_logo_light()} />
		</div>
		<figcaption>{m.brand_logo_light()}</figcaption>
	</figure>
</div>

<h2>{m.brand_mark_heading()}</h2>
<p class="muted">{m.brand_mark_note()}</p>

<div class="brand-grid three">
	<figure class="brand-tile">
		<div class="brand-canvas dark">
			<img class="mark" src="/brand/mementomori-ry-skull-light.svg" alt={m.brand_mark_light()} />
		</div>
		<figcaption>{m.brand_mark_light()}</figcaption>
	</figure>
	<figure class="brand-tile">
		<div class="brand-canvas light">
			<img class="mark" src="/brand/mementomori-ry-skull-dark.svg" alt={m.brand_mark_dark()} />
		</div>
		<figcaption>{m.brand_mark_dark()}</figcaption>
	</figure>
	<figure class="brand-tile">
		<div class="brand-canvas dark">
			<img class="mark" src="/brand/mementomori-ry-skull-purple.svg" alt={m.brand_mark_accent()} />
		</div>
		<figcaption>{m.brand_mark_accent()}</figcaption>
	</figure>
</div>

<h2>{m.brand_motion_heading()}</h2>
<p class="muted">{m.brand_motion_note()}</p>

<div class="brand-grid">
	<figure class="brand-tile">
		<div class="brand-canvas dark flush">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src="/brand/mementomori-ry-rainbow-skull-avatar.mp4" autoplay muted loop playsinline
			></video>
		</div>
		<figcaption>{m.brand_motion_rainbow()}</figcaption>
	</figure>
	<figure class="brand-tile">
		<div class="brand-canvas dark flush">
			<img src="/brand/mementomori-ry-pride-skull-2048.png" alt={m.brand_motion_pride()} />
		</div>
		<figcaption>{m.brand_motion_pride()}</figcaption>
	</figure>
</div>

<h2>{m.brand_colours_heading()}</h2>
<p class="muted">{m.brand_colours_note()}</p>

<ul class="swatches">
	{#each COLOURS as colour (colour.hex)}
		<li>
			<span class="swatch" style="background: {colour.hex}"></span>
			<span class="swatch-text">
				<span>{colour.name()}</span>
				<CopyField display={colour.hex} />
			</span>
		</li>
	{/each}
</ul>

<h2>{m.brand_type_heading()}</h2>
<p class="muted">{m.brand_type_note()}</p>

<div class="specimens">
	<div class="specimen">
		<p class="sample heading-sample">Mementomori ry</p>
		<p class="muted small">Zalando Sans Expanded · 600 · {m.brand_type_headings()}</p>
	</div>
	<div class="specimen">
		<p class="sample body-sample">Avointa, eurooppalaista ja hajautettua sosiaalista mediaa.</p>
		<p class="muted small">Zalando Sans · 400 / 500 · {m.brand_type_body()}</p>
	</div>
	<div class="specimen">
		<p class="sample code-sample">FI18 7997 9994 1234 56</p>
		<p class="muted small">Fira Code · 500 · {m.brand_type_code()}</p>
	</div>
</div>

<h2>{m.brand_usage_heading()}</h2>
<div class="usage">
	<div>
		<p class="usage-title ok-note">{m.brand_usage_do()}</p>
		<ul>
			<li>{m.brand_do_1()}</li>
			<li>{m.brand_do_2()}</li>
			<li>{m.brand_do_3()}</li>
		</ul>
	</div>
	<div>
		<p class="usage-title bad-note">{m.brand_usage_dont()}</p>
		<ul>
			<li>{m.brand_dont_1()}</li>
			<li>{m.brand_dont_2()}</li>
			<li>{m.brand_dont_3()}</li>
		</ul>
	</div>
</div>

<p class="muted small brand-contact">
	{m.brand_contact()}
	<a href="mailto:ry@mementomori.social">ry@mementomori.social</a>
</p>
