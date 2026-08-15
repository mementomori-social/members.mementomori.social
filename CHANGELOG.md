# Changelog

## 1.0.1 (unreleased)

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
