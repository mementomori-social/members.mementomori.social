<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>{m.members_heading()}</h1>

<p class="muted small">{m.members_note()}</p>

{#if data.members.length === 0}
	<p class="muted">{m.members_empty()}</p>
{:else}
	<ul class="member-rows">
		{#each data.members as member (member.id)}
			<li class="member-row">
				{#if member.mastodonAvatarUrl}
					<img class="row-avatar" src="/avatar/{member.id}" alt="" loading="lazy" />
				{:else}
					<div class="row-avatar placeholder" aria-hidden="true"></div>
				{/if}
				<div class="member-id">
					<span class="member-name">{member.displayName ?? member.fullName}</span>
					{#if member.mastodonAcct}
						<a class="small handle" href="https://mementomori.social/@{member.mastodonAcct}"
							>@{member.mastodonAcct}@mementomori.social</a
						>
					{/if}
				</div>
				<span class="muted small member-meta">
					{member.homeMunicipality} ·
					{member.memberClass === 'member' ? m.class_member() : m.class_patron()}
				</span>
			</li>
		{/each}
	</ul>
{/if}
