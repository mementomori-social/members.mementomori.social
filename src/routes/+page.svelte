<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { FEES, COSTS } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>{m.home_heading()}</h1>

<p>
	{m.home_intro_1()}
	<a href="https://mementomori.social" rel="me">mementomori.social</a>{m.home_intro_2()}
</p>

<p class="muted small">
	{m.home_id()}
	<a
		href="https://yhdistysrekisteri.prh.fi/basicinformation?userLang=en&businessId=3637371-4&timeZone=Europe%2FHelsinki"
		>3637371-4</a
	>, {m.home_registered()}
</p>

<h2>{m.membership_heading()}</h2>

<p>{m.membership_intro()}</p>

<div class="tiers">
	<div class="tier">
		<h3>{m.tier_member_title()}</h3>
		<p class="muted small">{m.tier_member_sub()}</p>
		<div class="price">
			{FEES.member.year}&nbsp;€<span> {m.price_line({ month: FEES.member.month })}</span>
		</div>
		<ul>
			<li>{m.benefit_vote()}</li>
			<li>{m.benefit_matrix()}</li>
			<li>{m.benefit_badge()}</li>
			<li>{m.benefit_feeling()} <img class="emoji" src="/assets/bundheart.png" alt="" /></li>
		</ul>
	</div>
	<div class="tier">
		<h3>{m.tier_patron_title()}</h3>
		<p class="muted small">{m.tier_patron_sub()}</p>
		<div class="price">
			{FEES.supporting.year}&nbsp;€<span> {m.price_line({ month: FEES.supporting.month })}</span>
		</div>
		<ul>
			<li>{m.benefit_speak()}</li>
			<li>{m.benefit_matrix()}</li>
			<li>{m.benefit_badge()}</li>
		</ul>
	</div>
</div>

<p class="muted small">{m.fees_note()}</p>

<p class="or-row">
	<a class="button" href={localizeHref('/join')}>{m.apply_cta()}</a>
	<a class="button ghost" href={localizeHref('/sponsorship')}>{m.sponsor_cta()}</a>
</p>

<h2>{m.money_heading()}</h2>

<p>{m.money_costs({ monthly: COSTS.monthlyEur, annual: COSTS.annualEur })}</p>

<div class="stats">
	<div class="stat">
		<div class="num">{data.memberCount}</div>
		<div class="lbl">
			{data.memberCount === 1 ? m.stat_member_singular() : m.stat_member_plural()}
		</div>
	</div>
	<div class="stat">
		<div class="num">{COSTS.monthlyEur}&nbsp;€</div>
		<div class="lbl">{m.stat_costs_label()}</div>
	</div>
</div>

{#if data.collectedEur !== null}
	<div class="card">
		<h3>{m.covered_heading()}</h3>
		<div class="progress">
			<div style="width: {Math.min(100, (data.collectedEur / COSTS.annualEur) * 100)}%"></div>
		</div>
		<p class="muted small">
			{m.covered_line({ collected: data.collectedEur.toFixed(2), annual: COSTS.annualEur })}
		</p>
	</div>
{/if}

<h2>{m.elsewhere_heading()}</h2>

<p class="small">
	<a href="https://mementomori.social" rel="me">mementomori.social</a>
	<span class="muted">{m.note_platform()}</span><br />
	<a href="https://help.mementomori.social">help.mementomori.social</a>
	<span class="muted">{m.note_docs()}</span><br />
	<a href="https://github.com/mementomori-social">github.com/mementomori-social</a>
	<span class="muted">{m.note_open_source()}</span>
</p>

<p class="contact muted small">
	{m.contact_pre()} <a href="https://mementomori.social/@ry" rel="me">@ry@mementomori.social</a>
</p>
