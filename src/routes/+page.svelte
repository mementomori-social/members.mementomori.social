<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { FEES, COSTS, coverage } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const cov = $derived(
		data.collected ? coverage(data.collected.fees, data.collected.income) : null
	);
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
			{FEES.member.month}&nbsp;€<span> {m.price_line()}</span>
		</div>
		<p class="price-alt small muted">{m.price_alt({ year: FEES.member.year })}</p>
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
			{FEES.supporting.month}&nbsp;€<span> {m.price_line()}</span>
		</div>
		<p class="price-alt small muted">{m.price_alt({ year: FEES.supporting.year })}</p>
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

{#if cov !== null}
	<div class="card">
		<h3>{m.covered_heading({ year: new Date().getFullYear() })}</h3>
		<p class="covered-total">
			<strong>{cov.remaining.toFixed(2).replace('.', ',')}&nbsp;€</strong>
			<span class="muted small">{m.covered_big_label()}</span>
		</p>
		<div class="progress stacked">
			<div class="seg-month" style="width: {(cov.members / COSTS.annualEur) * 100}%"></div>
			<div class="seg-earlier" style="width: {(cov.support / COSTS.annualEur) * 100}%"></div>
			<div class="seg-upcoming" style="width: {(cov.upcoming / COSTS.annualEur) * 100}%"></div>
		</div>
		<p class="legend small">
			<span
				><span class="dot ok"></span>
				{m.covered_seg_members()}: {cov.members.toFixed(2).replace('.', ',')}&nbsp;€</span
			>
			<span
				><span class="dot accent"></span>
				{m.covered_seg_support()}: {cov.support.toFixed(2).replace('.', ',')}&nbsp;€</span
			>
			<span
				><span class="dot warn"></span>
				{m.covered_seg_upcoming()}: {cov.upcoming.toFixed(2).replace('.', ',')}&nbsp;€</span
			>
			<span
				><span class="dot bad"></span>
				{m.covered_left({
					left: cov.remaining.toFixed(2).replace('.', ',')
				})}</span
			>
		</p>
	</div>

	<div class="card">
		<h3>{m.servers_covered_heading()}</h3>
		<p class="covered-total">
			{#if cov.marginDays > 0}
				<strong><span class="days-count">{cov.marginDays}</span> {m.servers_covered_unit()}</strong>
			{:else}
				<strong>{m.servers_covered_past()}</strong>
			{/if}
			<span
				class="fee-state inline"
				class:ok={cov.marginDays > 14}
				class:warn={cov.marginDays > 0 && cov.marginDays <= 14}
				class:bad={cov.marginDays <= 0}
			>
				<span class="dot"></span>
				{m.servers_covered_until({ date: cov.coveredUntil.toLocaleDateString('fi-FI') })}
			</span>
		</p>
		<div class="progress year-track">
			<div class="fill" style="width: {cov.coveredPct}%"></div>
			<span class="covered-date" style="left: {cov.coveredPct}%"
				>{cov.coveredUntil.toLocaleDateString('fi-FI')}</span
			>
		</div>
		<p class="bar-meta small">
			<span class:ok={cov.total > 0} class:muted={cov.total === 0}
				>1.1.{new Date().getFullYear()}</span
			>
			<span class="muted">31.12.{new Date().getFullYear()}</span>
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
