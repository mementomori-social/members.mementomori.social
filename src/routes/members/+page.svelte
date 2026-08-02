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
	<table class="list">
		<thead>
			<tr
				><th></th><th>{m.th_name()}</th><th>{m.th_municipality()}</th><th>{m.th_class()}</th><th
					>{m.th_fediverse()}</th
				></tr
			>
		</thead>
		<tbody>
			{#each data.members as member (member.id)}
				<tr>
					<td style="width:48px">
						{#if member.mastodonAvatarUrl}
							<img class="avatar" src="/avatar/{member.id}" alt="" loading="lazy" />
						{:else}
							<div
								class="avatar"
								style="width:40px;height:40px;border-radius:10px;background:var(--surface-2)"
							></div>
						{/if}
					</td>
					<td>{member.fullName}</td>
					<td class="muted">{member.homeMunicipality}</td>
					<td class="muted small"
						>{member.memberClass === 'member' ? m.class_member() : m.class_patron()}</td
					>
					<td class="small">
						{#if member.mastodonAcct}
							<a href="https://mementomori.social/@{member.mastodonAcct}">@{member.mastodonAcct}</a>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
