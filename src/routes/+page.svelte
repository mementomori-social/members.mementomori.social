<script lang="ts">
	import { FEES, COSTS } from '$lib/fees';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Sustainable, open source social media.</h1>

<p>
	Mementomori ry is a registered non-profit in Finland. It runs and funds the
	<a href="https://mementomori.social" rel="me">mementomori.social</a> social media platform, keeping
	it independent and member-supported.
</p>

<p class="muted small">
	ID <a
		href="https://yhdistysrekisteri.prh.fi/basicinformation?userLang=en&businessId=3637371-4&timeZone=Europe%2FHelsinki"
		>3637371-4</a
	>, Jyväskylä, Finland, registered 6 July 2026
</p>

<h2>Membership</h2>

<p>
	Membership funds the platform and gives you a say in how the association is run. Using
	mementomori.social stays free for everyone, member or not. The larger fee does not buy more
	influence: voting rights belong to regular members.
</p>

<div class="tiers">
	<div class="tier">
		<h3>{FEES.member.label}</h3>
		<p class="muted small">The standard membership for people who want to support our cause.</p>
		<div class="price">
			{FEES.member.year}&nbsp;€<span> / year, or {FEES.member.month}&nbsp;€ / month</span>
		</div>
		<ul>
			<li>Right to vote at the association meeting</li>
			<li>Access to the members' channel on Matrix</li>
			<li>Member badge on mementomori.social</li>
			<li>A nice feeling you are supporting a good cause 💜</li>
		</ul>
	</div>
	<div class="tier">
		<h3>{FEES.supporting.label}</h3>
		<p class="muted small">The larger membership for organisations and generous individuals.</p>
		<div class="price">
			{FEES.supporting.year}&nbsp;€<span> / year, or {FEES.supporting.month}&nbsp;€ / month</span>
		</div>
		<ul>
			<li>Right to attend and speak at the association meeting</li>
			<li>Access to the members' channel on Matrix</li>
			<li>Member badge on mementomori.social</li>
		</ul>
	</div>
</div>

<p class="muted small">
	Fees are fixed and set by the association meeting. The monthly option is an instalment of the
	annual fee. Joining fee is 0&nbsp;€, and membership is approved by the board.
</p>

<p><a class="button" href="/join">Apply for membership</a></p>

<h2>Where the money goes</h2>

<p>
	Running the mementomori.social infrastructure, websites and social media service costs
	<strong>{COSTS.monthlyEur}&nbsp;€ a month</strong>, about {COSTS.annualEur}&nbsp;€ a year.
</p>

<div class="stats">
	<div class="stat">
		<div class="num">{data.memberCount}</div>
		<div class="lbl">{data.memberCount === 1 ? 'member' : 'members'}</div>
	</div>
	<div class="stat">
		<div class="num">{COSTS.monthlyEur}&nbsp;€</div>
		<div class="lbl">running costs per month</div>
	</div>
</div>

{#if data.collectedEur !== null}
	<div class="card">
		<h3>Costs covered this year</h3>
		<div class="progress">
			<div style="width: {Math.min(100, (data.collectedEur / COSTS.annualEur) * 100)}%"></div>
		</div>
		<p class="muted small">
			{data.collectedEur.toFixed(2)}&nbsp;€ of {COSTS.annualEur}&nbsp;€ collected in membership
			fees.
		</p>
	</div>
{/if}

<h2>Elsewhere</h2>

<p class="small">
	<a href="https://mementomori.social" rel="me">mementomori.social</a>
	<span class="muted">social media platform</span><br />
	<a href="https://help.mementomori.social">help.mementomori.social</a>
	<span class="muted">documentation</span><br />
	<a href="https://github.com/mementomori-social">github.com/mementomori-social</a>
	<span class="muted">open source</span>
</p>

<p class="contact muted small">
	Contact <a href="https://mementomori.social/@ry" rel="me">@ry@mementomori.social</a>
</p>
