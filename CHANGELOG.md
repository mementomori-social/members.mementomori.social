### 1.10.1: 2026-08-19

* English translations of the rules and the founding charter
* Fix PDF sizes showing as 0 kB

### 1.10.0: 2026-08-19

* Each document has its own page with the full text
* Documents index as a row list
* Minimal PDF mark with a glass hover on document rows

### 1.9.0: 2026-08-18

* Documents page with the rules and the founding charter
* Member numbers in the register, on the board pages and in the profile
* Profile in two columns with visible input fields
* Clearer Matrix note linking to the Matrix page
* Status page link on the front page

### 1.8.0: 2026-08-18

* Language preference in the profile
* Saved language wins over the link's language
* Language switch updates the saved preference

### 1.7.4: 2026-08-18

* Rainbow hover animation on the logo
* Count bank payers in the coverage figures
* Join page links straight to the FAQ answer
* Clearer wording for monthly instalments
* Ask members to pay soon after joining
* Distinct gradients and coloured prices on tiers
* Link payment methods in the FAQ
* Copy confirmation no longer widens the box
* Narrower language menu
* Reject street addresses in the municipality field
* Even out top bar button heights
* Add PayPal to FAQ payment methods
* Mute member count line, white figure
* Drop PDF suffix from rules link

### 1.7.0: 2026-08-16

* Subscribers reach the Stripe portal via confirmation tooltip
* Schedule radios reflect the active Stripe subscription
* Resignation and schedule-switch guidance with contact links
* Allow form redirects to billing.stripe.com

### 1.6.1: 2026-08-16

* Restore monthly and yearly options on the dashboard

### 1.6.0: 2026-08-16

* Subscribers manage card, schedule and cancellation in Stripe's portal
* Subscription changes sync back on dashboard load
* Bank statement import with preview and dedup
* Mastodon sign-in credential created only after email verification
* Avatars served only where the member chose to be visible

### 1.5.1: 2026-08-16

* FAQ answers link PRH, Finlex, Stripe, Matrix and the instance
* FAQ questions open by direct link
* Reworded payment timing and real name answers
* Fuller bilingual sign-in email passes spam filters
* All enabled payment methods listed in the FAQ
* Jyväskylä linked, English wording fix
* First FAQ question open by default
* Minimal chevrons on all accordions
* Opening a question updates the shareable link
* FAQ deep links as clean paths

### 1.5.0: 2026-08-16

* FAQ page with the first five questions
* FAQ linked from the menu, footer and join page
* Yhdistyksen säännöt published as PDF
* Rules linked from the footer and the join page

### 1.4.1: 2026-08-16

* Matrix ID editable on the profile page
* Long handles truncate instead of wrapping
* Matrix column keeps its width in the roster
* Membership status says Paid until, not Valid until
* Live member count on the members page
* Matrix room described as open source and E2EE
* Monthly gap legend shows the uncovered amount
* Members-only phrase emphasised in the list note

### 1.4.0: 2026-08-16

* Board-only member detail page with all register data
* Roster links to details, shows email and Fediverse account
* Matrix IDs copyable, Not saved shown when empty
* Email and Mastodon shown with icons and links
* Tables scroll horizontally with edge fades
* Live member count on the board page
* Status labels capitalised
* Re-applying with a known email never duplicates the row
* Thin minimal scrollbars
* Statuses as plain coloured text everywhere

### 1.3.0: 2026-08-16

* Monthly coverage card with the recurring shortfall
* Yearly fees counted into the monthly picture
* Coverage balance survives the turn of the year

### 1.2.1: 2026-08-16

* Coverage card shows recurring card payments
* Estimated coverage date with upcoming renewals
* Name check requires two real name parts, not initials

### 1.2.0: 2026-08-16

* Cost coverage now moves with every payment
* Coverage date counts days, not whole months
* Remaining cost labelled for the rest of the year
* Full name required, handles and emoji rejected
* Mastodon display name no longer prefills the register name
* Dev server no longer posts to the board's Matrix room
* Name check accepts CJK names and mononyms
* Unpaid members told plainly that payment activates membership
* Higher join limit so shared networks are not blocked
* Joining never blocked by the name check
* Member area asks for a complete name before use
* Board sees which members need a name check
* Test addresses never notify the board
* Membership status kept on one line
* Tables scroll instead of wrapping on phones
* Member lists show newest members first
* Email shown with open applications
* Email addresses treated case-insensitively
* Tighter dashboard spacing on phones
* Days of coverage shown as the main figure
* Language menu stays on screen on phones
* Sign out shown as an icon on phones
* Saved forms keep showing the saved values
* Finnish and international Matrix servers suggested
* External link arrows removed
* Shorter Matrix and member list wording
* Member list no longer scrolls sideways on phones

### 1.1.1: 2026-08-15

* Payment state shown on the board page
* Paid membership shown as one status line
* Payment history is now the card heading
* Payment schedule label reads Jäsenmaksu
* Billing errors float as a dismissable bubble
* Locked card schedule explained with next step
* Full name requirement explained on the join form
* Matrix alert names the association
* Finnish wording and punctuation fixes

### 1.1.0: 2026-08-15

* Green success style for confirmation notices
* Clarify member list visibility in join notes
* Cancel button on the join form
* Join CTA says join, not sign in
* Board members can decide their own applications
* Plain-language email note, profile intro and other text fixes
* Green notice tweaks
* One board member approves members
* Status texts without trailing periods
* Language stays selected after signing out
* Live card payments via Stripe
* Rate limiting on sign-in and sign-up, stored in the database
* Member register rows claimable only with a verified address
* Rate limit on the join form
* Matrix ID saving checks membership status
* One Mastodon account links to one member only
* Database dumps ignored by git, preview URLs off
* Members can switch between monthly and yearly
* Monthly is the default payment schedule
* Styled error page with contact address
* No horizontal scrolling on phones
* Overdue fee summary also to Matrix
* Clearer coverage legend labels
* External link arrows as SVG, never emoji
* Prices lead with the monthly option
* Payment schedule moved into the dashboard header

### 1.0.0: 2026-08-15

* Membership application with Mastodon OAuth or form + magic link sign-in
* Finnish reference numbers and bank transfer instructions per member
* Daily automation endpoint: payment reminders, overdue board summary, Holvi transaction sync
* Sponsorship, contact, safer space pages, footer with version info, per-page OG metadata
* Board approval flow with audit trail
* Payment ledger: Stripe Checkout webhook and manual bank transfers, CSV exports
* Member register (yhdistyslaki 11 §) with CSV export
* Member list with locally proxied Mastodon avatars
* Members-only Matrix page with copyable room address and Matrix ID collection
* Cost transparency: public figures, members-only progress
* English and Finnish with URL-based locales
* WCAG AAA contrast, CSP and security headers
* Architecture documentation with infrastructure diagram
* Database access and backup documentation with a curl-only export script
* Privacy notice (GDPR) in both languages
* Responsive layout down to 320 px
* Custom language dropdown, identical across browsers
* Front page money section renamed to Members and costs
* Separate signed-in navigation with top-bar sign out
* Mastodon profile card with refresh feedback on the dashboard
* Copyable payment details and Finnish virtual bank barcode
* Paid or unpaid fee status on the member page
* Profile page for editing own details and managing the Mastodon link
* Unique ledger references end webhook double booking
* Servers-covered-until date with live margin indicator and year timeline
* Sponsorship income tracking in the costs-covered figure
* Display name separate from the statutory register name
* Verified email required for password sign-in
* Mastodon sign-in for linked accounts
* Compact board view with automation-first payment recording
* Board notification bell with open-application count
* Avatar chip in the top bar
* New applications announced in the Matrix admins room
* Locale preserved across sign-in, OAuth and payment redirects
* Costs-covered card with sponsor-paid months and stacked bar
* Public member list behind its own consent, visibility controls on the member page
* Coverage chart by source: member fees, other support, upcoming bill, remaining
* Consent card with pre-checked member list and privacy notice links
