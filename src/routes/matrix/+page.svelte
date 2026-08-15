<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import CopyField from '$lib/components/CopyField.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>{m.matrix_heading()}</h1>

<p>
	{m.matrix_intro_1()}
	<a href="https://matrix.org">{m.matrix_intro_word()}</a>{m.matrix_intro_2()}
	{m.matrix_e2e_note()}
</p>

<div class="card card-fit">
	<h3>{m.matrix_room()}</h3>
	<CopyField display="#members:chat.mementomori.social" />
</div>

<h2>{m.matrix_how_heading()}</h2>

<ol>
	<li>{m.matrix_how_1()}</li>
	<li>{m.matrix_how_2()}</li>
	<li>{m.matrix_how_3_1()} <a href="https://element.io">Element</a>.</li>
</ol>

<form method="POST" action="?/saveMatrix" class="stack" use:enhance>
	<label class="field" for="matrix-id">{m.matrix_id_label()}</label>
	<div class="input-group">
		<input
			id="matrix-id"
			type="text"
			name="matrixId"
			placeholder="@you:matrix.org"
			value={form?.matrixError ? '' : data.matrixId}
		/>
		<button type="submit">{m.save()}</button>
	</div>
	{#if form?.matrixError}<p class="error">{form.matrixError}</p>{/if}
	{#if form?.matrixSaved}
		<p class="ok-note small" role="status">
			✓ {form.cleared ? m.matrix_id_cleared() : m.matrix_id_saved()}
		</p>
	{/if}
</form>
