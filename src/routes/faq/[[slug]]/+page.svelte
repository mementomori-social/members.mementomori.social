<script lang="ts">
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';

	const PRH =
		'https://yhdistysrekisteri.prh.fi/basicinformation?userLang=en&businessId=3637371-4&timeZone=Europe%2FHelsinki';
	const FINLEX = 'https://www.finlex.fi/fi/laki/ajantasa/1989/19890503';
	const JKL = getLocale() === 'fi' ? 'https://visitjyvaskyla.fi/' : 'https://visitjyvaskyla.fi/en/';

	/** Deep links: /faq/slug opens that question, rendered open on the server
	    so the link works without JavaScript. Old ?q= links keep working. */
	const open = $derived(page.params.slug || page.url.searchParams.get('q'));

	$effect(() => {
		if (open) document.getElementById(open)?.scrollIntoView({ block: 'start' });
	});

	// Browsers fire toggle for initially open details at load; only real
	// interaction after mount may touch the address bar.
	let ready = false;
	$effect(() => {
		requestAnimationFrame(() => (ready = true));
	});

	/** Opening a question puts its deep link in the address bar so the view is
	    shareable; closing the linked one clears it. */
	function sync(e: Event) {
		if (!ready) return;
		const el = e.currentTarget as HTMLDetailsElement;
		if (el.open) replaceState(localizeHref(`/faq/${el.id}`), {});
		else if (open === el.id) replaceState(localizeHref('/faq'), {});
	}
</script>

<h1>{m.faq_heading()}</h1>

<div class="faq-list">
	<details class="fold" id="yhdistys" ontoggle={sync} open={open === 'yhdistys' || open === null}>
		<summary>{m.faq_q_what()}</summary>
		<p>
			{m.faq_a_what_1()}
			<a href={PRH}>3637371-4</a>{m.faq_a_what_2a()}
			<a href={JKL}>Jyväskylä</a>{m.faq_a_what_2b()}
			<a href="https://mementomori.social">mementomori.social</a>{m.faq_a_what_3()}
		</p>
	</details>

	<details class="fold" id="miksi-liittya" ontoggle={sync} open={open === 'miksi-liittya'}>
		<summary>{m.faq_q_why()}</summary>
		<p>
			{m.faq_a_why_1()}
			<a href="https://mementomori.social">{m.faq_a_why_masto()}</a>
			{m.faq_a_why_2()}
		</p>
		<p>
			{m.faq_a_why_3()}
			<a href={localizeHref('/matrix')}>{m.faq_a_why_matrix()}</a>
			{m.faq_a_why_4()}
		</p>
	</details>

	<details class="fold" id="maksutavat" ontoggle={sync} open={open === 'maksutavat'}>
		<summary>{m.faq_q_pay()}</summary>
		<p>{m.faq_a_pay_1()}</p>
		<p>
			{m.faq_a_pay_2()}
			<a href="https://stripe.com">Stripe</a>{m.faq_a_pay_3()}
		</p>
	</details>

	<details
		class="fold"
		id="maksamisen-ajankohta"
		ontoggle={sync}
		open={open === 'maksamisen-ajankohta'}
	>
		<summary>{m.faq_q_paywhen()}</summary>
		<p>
			{m.faq_a_paywhen_1()}
			<a href="https://mementomori.social">{m.faq_a_paywhen_masto()}</a>
			{m.faq_a_paywhen_2()}
		</p>
		<p>{m.faq_a_paywhen_3()}</p>
	</details>

	<details class="fold" id="oikea-nimi" ontoggle={sync} open={open === 'oikea-nimi'}>
		<summary>{m.faq_q_name()}</summary>
		<p>
			{m.faq_a_name_1()}
			<a href={FINLEX}>{m.faq_a_name_law()}</a>
			{m.faq_a_name_2()}
		</p>
		<p>{m.faq_a_name_3()}</p>
	</details>
</div>
