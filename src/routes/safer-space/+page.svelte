<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
</script>

<h1 class="rainbow">{m.safer_heading()}</h1>

<p>
	{m.safer_intro()}
	<a href="https://www.vaestoliitto.fi/vaestoliitto/turvallisemman-tilan-periaatteet/"
		>{m.safer_read_more()}</a
	>.
</p>

<ol class="principles">
	<li>{m.safer_1()}</li>
	<li>{m.safer_2()}</li>
	<li>{m.safer_3()}</li>
	<li>{m.safer_4()}</li>
	<li>{m.safer_5()}</li>
	<li>{m.safer_6()}</li>
</ol>

<p>{m.safer_report()}</p>

<p class="muted small">{m.safer_draft_note()}</p>
