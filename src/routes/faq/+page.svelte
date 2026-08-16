<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';

	const items = [
		{ q: m.faq_q_why, a: m.faq_a_why },
		{ q: m.faq_q_pay, a: m.faq_a_pay },
		{ q: m.faq_q_paywhen, a: m.faq_a_paywhen },
		{ q: m.faq_q_what, a: m.faq_a_what },
		{ q: m.faq_q_name, a: m.faq_a_name }
	];
</script>

<h1>{m.faq_heading()}</h1>

<div class="faq-list">
	{#each items as item (item.q)}
		<details class="fold">
			<summary>{item.q()}</summary>
			<p>{item.a()}</p>
		</details>
	{/each}
</div>
