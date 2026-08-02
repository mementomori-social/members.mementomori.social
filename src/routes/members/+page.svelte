<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Members</h1>

<p class="muted small">
	Only members who have opted in are listed here. The full member register is maintained by
	the board as required by the Finnish Associations Act.
</p>

{#if data.members.length === 0}
	<p class="muted">No members have opted into the list yet.</p>
{:else}
	<table class="list">
		<thead>
			<tr><th></th><th>Name</th><th>Municipality</th><th>Class</th><th>Fediverse</th></tr>
		</thead>
		<tbody>
			{#each data.members as m (m.id)}
				<tr>
					<td style="width:42px">
						{#if m.mastodonAvatarUrl}
							<img class="avatar" src="/avatar/{m.id}" alt="" loading="lazy" />
						{:else}
							<div class="avatar" style="width:32px;height:32px;border-radius:8px;background:var(--border)"></div>
						{/if}
					</td>
					<td>{m.fullName}</td>
					<td class="muted">{m.homeMunicipality}</td>
					<td class="muted small">{m.memberClass === 'member' ? 'Member' : 'Supporting'}</td>
					<td class="small">
						{#if m.mastodonAcct}
							<a href="https://mementomori.social/@{m.mastodonAcct}">@{m.mastodonAcct}</a>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
