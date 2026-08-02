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
	The association is funded by its members. Using mementomori.social is free and open to everyone,
	and does not require membership. Membership is how the platform's costs get covered, and it comes
	with a say in how the association is run.
</p>

<div class="tiers">
	<div class="tier">
		<h3>{FEES.member.label}</h3>
		<div class="price">
			{FEES.member.year} €<span> / year, or {FEES.member.month} € / month</span>
		</div>
		<p class="muted small">One vote at the association meeting.</p>
	</div>
	<div class="tier">
		<h3>{FEES.supporting.label}</h3>
		<div class="price">
			{FEES.supporting.year} €<span> / year, or {FEES.supporting.month} € / month</span>
		</div>
		<p class="muted small">
			The right to attend and speak at the association meeting. Open to individuals and
			organisations.
		</p>
	</div>
</div>

<p class="muted small">
	Fees are fixed and set by the association meeting. The monthly option is an instalment of the
	annual fee. Joining fee is 0 €, and membership is approved by the board.
</p>

<p><a class="button" href="/join">Apply for membership</a></p>

<h2>Where the money goes</h2>

<p>
	Running the mementomori.social infrastructure, websites and social media service costs
	<strong>{COSTS.monthlyEur} € a month</strong>, about {COSTS.annualEur} € a year. The association currently
	has {data.memberCount} approved
	{data.memberCount === 1 ? 'member' : 'members'}.
</p>

{#if data.collectedEur !== null}
	<div class="card">
		<h3>Costs covered this year</h3>
		<div class="progress">
			<div style="width: {Math.min(100, (data.collectedEur / COSTS.annualEur) * 100)}%"></div>
		</div>
		<p class="muted small">
			{data.collectedEur.toFixed(2)} € of {COSTS.annualEur} € collected in membership fees.
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
