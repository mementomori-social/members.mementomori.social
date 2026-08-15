<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
</script>

<h1>{m.privacy_heading()}</h1>

<p>{m.privacy_intro()}</p>

<h2>{m.privacy_controller_h()}</h2>
<p>
	{m.privacy_controller_1()}
	<a href="mailto:ry@mementomori.social">ry@mementomori.social</a>
</p>

<h2>{m.privacy_data_h()}</h2>
<ul>
	<li>{m.privacy_data_register()}</li>
	<li>{m.privacy_data_optional()}</li>
	<li>{m.privacy_data_payment()}</li>
	<li>{m.privacy_data_technical()}</li>
</ul>

<h2>{m.privacy_basis_h()}</h2>
<ul>
	<li>{m.privacy_basis_register()}</li>
	<li>{m.privacy_basis_membership()}</li>
	<li>{m.privacy_basis_accounting()}</li>
	<li>{m.privacy_basis_consent()}</li>
	<li>{m.privacy_basis_security()}</li>
</ul>

<h2>{m.privacy_recipients_h()}</h2>
<ul>
	<li><a href="https://www.cloudflare.com">Cloudflare</a>: {m.privacy_proc_cf()}</li>
	<li><a href="https://stripe.com">Stripe</a>: {m.privacy_proc_stripe()}</li>
	<li><a href="https://www.mailgun.com">Mailgun</a>: {m.privacy_proc_mailgun()}</li>
	<li>
		<a href="https://www.hetzner.com">Hetzner</a>: {m.privacy_proc_hetzner()};
		<a href="https://nextcloud.com">Nextcloud</a>: {m.privacy_proc_nextcloud()}
	</li>
	<li><a href="https://github.com">GitHub</a>: {m.privacy_proc_github()}</li>
</ul>

<p>{m.privacy_recipients_2()}</p>

<p>{m.privacy_recipients_3()}</p>

<h2>{m.privacy_retention_h()}</h2>
<p>{m.privacy_retention()}</p>

<h2>{m.privacy_rights_h()}</h2>
<p>{m.privacy_rights_intro()}</p>
<ul>
	<li>{m.privacy_right_access()}</li>
	<li>{m.privacy_right_rectify()}</li>
	<li>{m.privacy_right_erase()}</li>
	<li>{m.privacy_right_restrict()}</li>
	<li>{m.privacy_right_withdraw()}</li>
	<li>
		{m.privacy_right_complain_1()} (<a href={m.privacy_ombudsman_url()}>tietosuoja.fi</a>)
	</li>
</ul>
<p>
	{m.privacy_rights_how_1()}
	<a href="mailto:ry@mementomori.social">ry@mementomori.social</a>.
	{m.privacy_rights_how_2()}
</p>

<h2>{m.privacy_security_h()}</h2>
<p>
	{m.privacy_security_1()}
	<a href="https://github.com/mementomori-social/members.mementomori.social">GitHub</a>.
	{m.privacy_security_2()}
</p>
<p>{m.privacy_public_list()}</p>

<h2>{m.privacy_changes_h()}</h2>
<p>
	{m.privacy_changes()}
	{m.privacy_updated({ date: new Date(__BUILDDATE__).toLocaleDateString('fi-FI') })}
</p>
