<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const roleLabel = (r: string) =>
		({ chair: m.role_chair(), secretary: m.role_secretary(), treasurer: m.role_treasurer() })[r] ??
		r;
</script>

<h1>{m.contact_heading()}</h1>

<p>{m.contact_intro()}</p>

<div class="people">
	{#each data.board as person (person.acct)}
		<div class="person">
			{#if person.avatar}
				<img class="portrait" src={person.avatar} alt="" loading="lazy" />
			{:else}
				<div class="portrait placeholder"></div>
			{/if}
			<h3>{person.displayName}</h3>
			<p class="muted small">{roleLabel(person.role)}</p>
			<p class="small">
				<a href="mailto:{person.email}">{person.email}</a><br />
				<a href={person.url} rel="me">@{person.acct}</a>
			</p>
		</div>
	{/each}
</div>

<p>
	{m.contact_general()}:
	<a href="mailto:ry@mementomori.social">ry@mementomori.social</a>
</p>
