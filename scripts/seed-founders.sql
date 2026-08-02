-- Founding members of Mementomori ry, members since the founding charter
-- 5 July 2026 (perustamiskirja). They did not apply through the site, so the
-- rows are inserted directly, without a login. Each row is claimed
-- automatically when that person signs up with the matching email.
--
-- Fill in the email addresses before running. Run against local:
--   pnpm exec wrangler d1 execute DB --local --file scripts/seed-founders.sql
-- or production:
--   pnpm exec wrangler d1 execute DB --remote --file scripts/seed-founders.sql
INSERT INTO member (id, user_id, full_name, home_municipality, email, member_class,
	billing_interval, mastodon_acct, listed_consent, status, applied_at, decided_at)
VALUES
	(lower(hex(randomblob(16))), NULL, '<FULL_NAME_CHAIR>', 'Jyväskylä',
		'<EMAIL_ROLLE>', 'member', 'year', 'rolle', 0, 'approved', 1783242000, 1783242000),
	(lower(hex(randomblob(16))), NULL, '<FULL_NAME_SECRETARY>', 'Jyväskylä',
		'<EMAIL_VEERA>', 'member', 'year', 'mustikkasoppa', 0, 'approved', 1783242000, 1783242000),
	(lower(hex(randomblob(16))), NULL, '<FULL_NAME_TREASURER>', 'Helsinki',
		'<EMAIL_ILKKA>', 'member', 'year', 'ikkeT', 0, 'approved', 1783242000, 1783242000);
