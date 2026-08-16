<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let scroller = $state<HTMLElement>();
	let fadeLeft = $state(false);
	let fadeRight = $state(false);
	let scrolling = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	function update() {
		if (!scroller) return;
		fadeLeft = scroller.scrollLeft > 2;
		fadeRight = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2;
	}

	function onScroll() {
		scrolling = true;
		clearTimeout(timer);
		timer = setTimeout(() => {
			scrolling = false;
			update();
		}, 300);
	}

	$effect(() => {
		update();
		const ro = new ResizeObserver(update);
		if (scroller) ro.observe(scroller);
		return () => ro.disconnect();
	});
</script>

<div
	class="table-scroll-wrap"
	class:fade-left={fadeLeft}
	class:fade-right={fadeRight}
	class:scrolling
>
	<div class="table-scroll" bind:this={scroller} onscroll={onScroll}>
		{@render children()}
	</div>
</div>
