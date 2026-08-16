# Changelog

## 1.2.1 (16.8.2026)

- Coverage card shows recurring card payments
- Estimated coverage date with upcoming renewals

## 1.2.0 (16.8.2026)

- Cost coverage now moves with every payment
- Coverage date counts days, not whole months
- Remaining cost labelled for the rest of the year
- Full name required, handles and emoji rejected
- Mastodon display name no longer prefills the register name
- Dev server no longer posts to the board's Matrix room
- Name check accepts CJK names and mononyms
- Unpaid members told plainly that payment activates membership
- Higher join limit so shared networks are not blocked
- Joining never blocked by the name check
- Member area asks for a complete name before use
- Board sees which members need a name check
- Test addresses never notify the board
- Membership status kept on one line
- Tables scroll instead of wrapping on phones
- Member lists show newest members first
- Email shown with open applications
- Email addresses treated case-insensitively
- Tighter dashboard spacing on phones
- Days of coverage shown as the main figure
- Language menu stays on screen on phones
- Sign out shown as an icon on phones
- Saved forms keep showing the saved values
- Finnish and international Matrix servers suggested
- External link arrows removed
- Shorter Matrix and member list wording
- Member list no longer scrolls sideways on phones

## 1.1.1 (15.8.2026)

- Payment state shown on the board page
- Paid membership shown as one status line
- Payment history is now the card heading
- Payment schedule label reads Jäsenmaksu
- Billing errors float as a dismissable bubble
- Locked card schedule explained with next step
- Full name requirement explained on the join form
- Matrix alert names the association
- Finnish wording and punctuation fixes

## 1.1.0 (15.8.2026)

- Green success style for confirmation notices
- Clarify member list visibility in join notes
- Cancel button on the join form
- Join CTA says join, not sign in
- Board members can decide their own applications
- Plain-language email note, profile intro and other text fixes
- Green notice tweaks
- One board member approves members
- Status texts without trailing periods
- Language stays selected after signing out
- Live card payments via Stripe
- Rate limiting on sign-in and sign-up, stored in the database
- Member register rows claimable only with a verified address
- Rate limit on the join form
- Matrix ID saving checks membership status
- One Mastodon account links to one member only
- Database dumps ignored by git, preview URLs off
- Members can switch between monthly and yearly
- Monthly is the default payment schedule
- Styled error page with contact address
- No horizontal scrolling on phones
- Overdue fee summary also to Matrix
- Clearer coverage legend labels
- External link arrows as SVG, never emoji
- Prices lead with the monthly option
- Payment schedule moved into the dashboard header

## 1.0.0 (15.8.2026)

- Membership application with Mastodon OAuth or form + magic link sign-in
- Finnish reference numbers and bank transfer instructions per member
- Daily automation endpoint: payment reminders, overdue board summary, Holvi transaction sync
- Sponsorship, contact, safer space pages, footer with version info, per-page OG metadata
- Board approval flow with audit trail
- Payment ledger: Stripe Checkout webhook and manual bank transfers, CSV exports
- Member register (yhdistyslaki 11 §) with CSV export
- Member list with locally proxied Mastodon avatars
- Members-only Matrix page with copyable room address and Matrix ID collection
- Cost transparency: public figures, members-only progress
- English and Finnish with URL-based locales
- WCAG AAA contrast, CSP and security headers
- Architecture documentation with infrastructure diagram
- Database access and backup documentation with a curl-only export script
- Privacy notice (GDPR) in both languages
- Responsive layout down to 320 px
- Custom language dropdown, identical across browsers
- Front page money section renamed to Members and costs
- Separate signed-in navigation with top-bar sign out
- Mastodon profile card with refresh feedback on the dashboard
- Copyable payment details and Finnish virtual bank barcode
- Paid or unpaid fee status on the member page
- Profile page for editing own details and managing the Mastodon link
- Unique ledger references end webhook double booking
- Servers-covered-until date with live margin indicator and year timeline
- Sponsorship income tracking in the costs-covered figure
- Display name separate from the statutory register name
- Verified email required for password sign-in
- Mastodon sign-in for linked accounts
- Compact board view with automation-first payment recording
- Board notification bell with open-application count
- Avatar chip in the top bar
- New applications announced in the Matrix admins room
- Locale preserved across sign-in, OAuth and payment redirects
- Costs-covered card with sponsor-paid months and stacked bar
- Public member list behind its own consent, visibility controls on the member page
- Coverage chart by source: member fees, other support, upcoming bill, remaining
- Consent card with pre-checked member list and privacy notice links
