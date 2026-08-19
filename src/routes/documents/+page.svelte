<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { DOCUMENTS } from '$lib/documents';
	/** Pointer position drives the sheen; without it the rows stay flat. */
	function sheen(node: HTMLElement) {
		const move = (e: PointerEvent) => {
			const r = node.getBoundingClientRect();
			node.style.setProperty('--mx', `${e.clientX - r.left}px`);
			node.style.setProperty('--my', `${e.clientY - r.top}px`);
		};
		node.addEventListener('pointermove', move);
		return { destroy: () => node.removeEventListener('pointermove', move) };
	}
</script>

<h1>{m.documents_heading()}</h1>
<p>{m.documents_intro()}</p>

<ul class="doc-list">
	{#each DOCUMENTS as doc (doc.slug)}
		<li>
			<a class="doc-row" href={localizeHref(`/documents/${doc.slug}`)} use:sheen>
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
				<span class="doc-row-text">
					<span class="doc-row-title">{doc.title()}</span>
					<span class="muted small">{doc.meta()}</span>
				</span>
			</a>
		</li>
	{/each}
</ul>
