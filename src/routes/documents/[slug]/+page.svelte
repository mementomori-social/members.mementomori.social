<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { findDocument } from '$lib/documents';
	import { fileSize } from '$lib/format';
	import Rules from '$lib/components/documents/Rules.svelte';
	import Charter from '$lib/components/documents/Charter.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const doc = $derived(findDocument(data.slug)!);
</script>

<p class="back-link">
	<a href={localizeHref('/documents')}>{m.documents_back()}</a>
</p>

<h1>{doc.title()}</h1>
<p class="muted small">{doc.meta()}</p>

<article class="doc">
	{#if data.slug === 'saannot'}
		<Rules />
	{:else}
		<Charter />
	{/if}

	<a class="doc-dl" href={doc.file} download>
		<span class="pdf-mark" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
				<path
					d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5Z"
					stroke-linejoin="round"
				/>
				<path d="M14.5 3v4.5H19" stroke-linejoin="round" />
				<path d="M8.5 13.5h7M8.5 16.5h4.5" stroke-linecap="round" />
			</svg>
		</span>
		<span class="doc-dl-text">
			{doc.fileName()}
			<span class="muted small">PDF, {fileSize(data.size)}</span>
		</span>
	</a>
</article>
