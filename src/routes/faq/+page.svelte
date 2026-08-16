<script lang="ts">
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	const PRH =
		'https://yhdistysrekisteri.prh.fi/basicinformation?userLang=en&businessId=3637371-4&timeZone=Europe%2FHelsinki';
	const FINLEX = 'https://www.finlex.fi/fi/laki/ajantasa/1989/19890503';

	/** Deep links: /faq?q=slug opens that question, rendered open on the server
	    so the link works without JavaScript. */
	const open = $derived(page.url.searchParams.get('q'));

	$effect(() => {
		if (open) document.getElementById(open)?.scrollIntoView({ block: 'start' });
	});
</script>

<h1>{m.faq_heading()}</h1>

<div class="faq-list">
	<details class="fold" id="yhdistys" open={open === 'yhdistys'}>
		<summary>{m.faq_q_what()}</summary>
		<p>
			{m.faq_a_what_1()}
			<a href={PRH}>3637371-4</a>{m.faq_a_what_2()}
			<a href="https://mementomori.social">mementomori.social</a>{m.faq_a_what_3()}
		</p>
	</details>

	<details class="fold" id="miksi-liittya" open={open === 'miksi-liittya'}>
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

	<details class="fold" id="maksutavat" open={open === 'maksutavat'}>
		<summary>{m.faq_q_pay()}</summary>
		<p>{m.faq_a_pay_1()}</p>
		<p>
			{m.faq_a_pay_2()}
			<a href="https://stripe.com">Stripe</a>{m.faq_a_pay_3()}
		</p>
	</details>

	<details class="fold" id="maksamisen-ajankohta" open={open === 'maksamisen-ajankohta'}>
		<summary>{m.faq_q_paywhen()}</summary>
		<p>
			{m.faq_a_paywhen_1()}
			<a href="https://mementomori.social">{m.faq_a_paywhen_masto()}</a>
			{m.faq_a_paywhen_2()}
		</p>
		<p>{m.faq_a_paywhen_3()}</p>
	</details>

	<details class="fold" id="oikea-nimi" open={open === 'oikea-nimi'}>
		<summary>{m.faq_q_name()}</summary>
		<p>
			{m.faq_a_name_1()}
			<a href={FINLEX}>{m.faq_a_name_law()}</a>
			{m.faq_a_name_2()}
		</p>
		<p>{m.faq_a_name_3()}</p>
	</details>
</div>
