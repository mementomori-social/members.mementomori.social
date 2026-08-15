# Database access and backups

The app uses [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite). Schema lives in `src/lib/server/db/schema.ts`, migrations in `drizzle/`.

## Direct access

Local development database (miniflare state under `.wrangler/`):

```sh
pnpm exec wrangler d1 execute DB --local --command "select * from member"
```

Production:

```sh
pnpm exec wrangler d1 execute DB --remote --command "select count(*) from member"
pnpm exec wrangler d1 execute DB --remote --file fix.sql
```

Ad hoc dumps in either direction:

```sh
pnpm exec wrangler d1 export DB --remote --output dump.sql
```

Treat `--remote` writes like production surgery: take a dump first, and prefer fixing through the app or a migration.

## Backup layers

Three independent layers protect the data:

1. **[Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)**, built into D1: automatic point-in-time restore for the last 30 days, nothing to configure.

   ```sh
   pnpm exec wrangler d1 time-travel info DB
   pnpm exec wrangler d1 time-travel restore DB --timestamp=2026-08-15T12:00:00Z
   ```

2. **Nightly off-Cloudflare exports** with [`scripts/backup-d1.sh`](../scripts/backup-d1.sh): a curl-only script that runs on any server, pulls a full SQL dump through the D1 export API, gzips it into a directory covered by an existing off-site backup job, and optionally uploads a second copy to Nextcloud over WebDAV. Schedule it with cron:

   ```
   30 4 * * * . /etc/members-backup.env && /opt/members/backup-d1.sh
   ```

   The env file holds `CF_ACCOUNT_ID`, `CF_D1_TOKEN` (a token scoped to D1 read only), `D1_DATABASE_ID`, `BACKUP_DIR` and the optional `NEXTCLOUD_*` values. Local retention is 60 dumps; the off-site copies follow their own targets' retention.

3. **Everything else is reproducible**: schema and code are in git, secrets live in the password manager, so a restore is `d1 create` + migrations + the newest dump.

## Restore from a dump

```sh
gunzip members-d1-2026-08-15_0430.sql.gz
pnpm exec wrangler d1 execute DB --remote --file members-d1-2026-08-15_0430.sql
```

Restore into a fresh database and switch the binding over rather than importing over a live one.
