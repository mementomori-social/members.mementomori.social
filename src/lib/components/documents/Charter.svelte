<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
</script>

{#if getLocale() === 'fi'}
	<p>
		Me allekirjoittaneet olemme perustaneet Mementomori ry -nimisen yhdistyksen, liittyneet siihen
		jäseniksi ja hyväksyneet sen säännöt.
	</p>
	<p>Jyväskylä, 5.7.2026</p>
{:else}
	<p class="muted small doc-translation">{m.doc_translation_note()}</p>
	<p>
		We the undersigned have founded an association named Mementomori ry, joined it as members and
		approved its rules.
	</p>
	<p>Jyväskylä, 5 July 2026</p>
{/if}
<ul class="founders">
	<li>Rolle Laukkarinen, Jyväskylä</li>
	<li>Veera Laukkarinen, Jyväskylä</li>
	<li>Ilkka Tengvall, Helsinki</li>
</ul>
<p class="muted small">{m.doc_charter_note()}</p>
