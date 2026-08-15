<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	let {
		label = '',
		display,
		copyValue = display
	}: { label?: string; display: string; copyValue?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		try {
			await navigator.clipboard.writeText(copyValue);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} catch {
			/* clipboard unavailable: leave the value selectable */
		}
	}
</script>

<div class="copy-field">
	{#if label}<span class="copy-label">{label}</span>{/if}
	<button type="button" class="copy-box" class:copied onclick={copy}>
		<span class="copy-value">{display}</span>
		<span class="copy-state" aria-live="polite">
			<span class="state-idle" aria-hidden={copied}>
				<svg
					viewBox="0 0 24 24"
					width="15"
					height="15"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
				<span class="visually-hidden">{m.copy()}</span>
			</span>
			<span class="state-done" aria-hidden={!copied}>
				<svg
					viewBox="0 0 24 24"
					width="15"
					height="15"
					fill="none"
					stroke="currentColor"
					stroke-width="2.4"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M20 6 9 17l-5-5" />
				</svg>
				{m.copied()}
			</span>
		</span>
	</button>
</div>
