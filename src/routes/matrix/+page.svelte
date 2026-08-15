<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import CopyField from '$lib/components/CopyField.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>{m.matrix_heading()}</h1>

<p>{m.matrix_intro()}</p>

<div class="card card-text-width">
	<h3>{m.matrix_room()}</h3>
	<CopyField label={m.matrix_room_alias()} display="#members:chat.mementomori.social" />
	<CopyField label={m.matrix_room_server()} display="chat.mementomori.social" />
</div>

<h2>{m.matrix_how_heading()}</h2>

<ol>
	<li>{m.matrix_how_1()}</li>
	<li>{m.matrix_how_2()}</li>
	<li>{m.matrix_how_3()}</li>
</ol>

<form method="POST" action="?/saveMatrix" class="stack" use:enhance>
	<label class="field">
		{m.matrix_id_label()}
		<input
			type="text"
			name="matrixId"
			placeholder="@you:matrix.org"
			value={form?.matrixError ? '' : data.matrixId}
		/>
	</label>
	{#if form?.matrixError}<p class="error">{form.matrixError}</p>{/if}
	{#if form?.matrixSaved}<p class="notice">{m.matrix_id_saved()}</p>{/if}
	<div><button type="submit" class="ghost">{m.save()}</button></div>
</form>
