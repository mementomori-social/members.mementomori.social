<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import RulesFi from './RulesFi.svelte';
	import RulesEn from './RulesEn.svelte';
</script>

{#if getLocale() === 'fi'}
	<RulesFi />
{:else}
	<RulesEn />
{/if}
