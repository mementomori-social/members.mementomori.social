<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { FEES, COSTS, coverage } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const cov = $derived(
		data.collected && data.collectedAll ? coverage(data.collectedAll, data.collected) : null
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

<h2>{m.partners_heading()}</h2>

<div class="partner">
	<a class="partner-logo" href="https://upcloud.com" rel="noopener sponsored" aria-label="UpCloud">
		<svg
			width="218"
			height="40"
			viewBox="0 0 870 160"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M88.2404 113.383V75.5889H73.1034V128.52H171.971C186.294 128.52 197.906 116.908 197.906 102.585C197.906 88.262 186.294 76.6494 171.971 76.6494H105.595V91.7865H171.971C177.938 91.7865 182.759 96.6179 182.759 102.574C182.759 108.53 177.927 113.362 171.971 113.362H88.2511L88.2404 113.383Z"
				fill="#7B00FF"
			/>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M117.754 18.3402H72.0643V3.20312H117.754C132.077 3.20312 143.689 14.8157 143.689 29.1386C143.689 43.4614 132.077 55.074 117.754 55.074H25.9354C19.9685 55.074 15.1477 59.9054 15.1477 65.8617C15.1477 71.8179 19.9792 76.6494 25.9354 76.6494H54.7204V91.7864H25.9354C11.6126 91.7864 0 80.1738 0 65.851C0 51.5281 11.6126 39.9155 25.9354 39.9155H117.754C123.721 39.9155 128.542 35.0841 128.542 29.1278C128.542 23.1716 123.71 18.3402 117.754 18.3402Z"
				fill="#7B00FF"
			/>
			<path
				d="M260.04 82.7341V2.36743H277.127V80.9129C277.127 107.095 290.035 117.818 309.125 117.818C328.215 117.818 340.76 107.095 340.76 80.9129V2.36743H357.675V82.7448C357.675 116.018 338.039 132.012 309.125 132.012C280.212 132.012 260.029 116.008 260.029 82.7448L260.04 82.7341Z"
				fill="#7B00FF"
			/>
			<path
				d="M367.692 37.9979H383.697V51.8173C391.153 40.7189 401.522 35.6411 414.249 35.6411C436.617 35.6411 454.25 55.2775 454.25 83.9982C454.25 112.719 436.617 132.002 414.249 132.002C401.522 132.002 390.253 126.367 383.697 115.997V159.758H367.692V37.9979ZM410.414 118.547C427.865 118.547 437.689 104.181 437.689 83.9982C437.689 63.8155 427.865 48.9034 410.414 48.9034C392.963 48.9034 382.775 63.9976 382.775 83.8161C382.775 103.635 393.134 118.536 410.414 118.536V118.547Z"
				fill="#7B00FF"
			/>
			<path
				d="M460.603 66.0009C460.603 26.3639 484.246 0 518.055 0C547.697 0 566.241 18.3616 569.883 45.8182H552.796C549.518 29.085 538.795 14.1729 518.077 14.1729C492.805 14.1729 477.711 36.3482 477.711 65.9902C477.711 95.6322 493.17 117.818 518.077 117.818C539.716 117.818 551.35 102.36 553.889 85.6373H571.158C566.059 116.726 545.887 132.002 518.055 132.002C483.689 132.002 460.603 105.82 460.603 66.0009Z"
				fill="#7B00FF"
			/>
			<path d="M579.707 2.36743H595.711V129.645H579.707V2.36743Z" fill="#7B00FF" />
			<path
				d="M602.975 83.8268C602.975 56.5523 619.333 35.6411 647.165 35.6411C674.996 35.6411 691.354 56.5523 691.354 83.8268C691.354 111.101 674.996 132.013 647.165 132.013C619.333 132.013 602.975 111.283 602.975 83.8268ZM647.165 118.729C667.165 118.729 674.803 101.642 674.803 83.634C674.803 65.6259 667.165 48.9141 647.165 48.9141C627.164 48.9141 619.526 65.8295 619.526 83.634C619.526 101.438 626.982 118.729 647.165 118.729Z"
				fill="#7B00FF"
			/>
			<path
				d="M697.354 95.4608V38.0086H713.358V94.3681C713.358 110.373 722.453 118.547 735.534 118.547C748.614 118.547 760.269 107.277 760.269 90.9079V37.9979H776.274V129.634H760.269V115.451C754.27 126.367 742.818 132.002 729.899 132.002C710.809 132.002 697.343 119.275 697.343 95.4608H697.354Z"
				fill="#7B00FF"
			/>
			<path
				d="M782.991 83.4518C782.991 54.7204 800.817 35.6303 822.81 35.6303C835.901 35.6303 847.171 41.0831 853.534 51.6351V2.36743H869.539V129.645H853.534V115.826C846.271 126.742 835.901 132.002 822.81 132.002C800.817 132.002 782.991 112.365 782.991 83.4518ZM826.999 118.547C844.267 118.547 854.455 103.635 854.455 83.6339C854.455 63.6333 844.267 48.9141 826.999 48.9141C809.73 48.9141 799.542 63.4619 799.542 83.4625C799.542 103.463 809.548 118.557 826.999 118.557V118.547Z"
				fill="#7B00FF"
			/>
		</svg>
	</a>
	<p>{m.partner_upcloud_intro()}</p>
	<a href="https://upcloud.com" rel="noopener sponsored">upcloud.com</a>
</div>

<h2>{m.membership_heading()}</h2>

<p>{m.membership_intro()}</p>

<div class="tiers">
	<div class="tier tier-member">
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
	<div class="tier tier-patron">
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
			<span class="covered-date" style="left: {Math.min(cov.coveredPct, 94)}%"
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
	<span class="muted">{m.note_open_source()}</span><br />
	<a href="https://status.mementomori.social">status.mementomori.social</a>
	<span class="muted">{m.note_status()}</span>
</p>

<p class="contact muted small">
	{m.contact_pre()} <a href="https://mementomori.social/@ry" rel="me">@ry@mementomori.social</a>
</p>
