#!/usr/bin/env bash
# Nightly export of the production D1 database, using only curl and the
# Cloudflare REST API, so it runs on any server without Node or wrangler.
#
# Required environment (put in a root-only env file, never in this repo):
#   CF_ACCOUNT_ID     Cloudflare account id
#   CF_D1_TOKEN       API token with D1 read access
#   D1_DATABASE_ID    the database uuid from wrangler.jsonc
#   BACKUP_DIR        local directory for dumps (point at a directory that an
#                     existing storagebox backup job already covers)
# Optional, for a second copy on Nextcloud via WebDAV:
#   NEXTCLOUD_URL     e.g. https://cloud.example.org/remote.php/dav/files/user/Backups
#   NEXTCLOUD_USER    Nextcloud username
#   NEXTCLOUD_PASS    Nextcloud app password
#
# Retention: keeps the newest 60 dumps locally; remote copies inherit the
# retention of their own backup targets.
set -euo pipefail

: "${CF_ACCOUNT_ID:?}" "${CF_D1_TOKEN:?}" "${D1_DATABASE_ID:?}" "${BACKUP_DIR:?}"

api="https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${D1_DATABASE_ID}"
auth=(-H "Authorization: Bearer ${CF_D1_TOKEN}" -H "Content-Type: application/json")
stamp="$(date +%Y-%m-%d_%H%M)"
out="${BACKUP_DIR}/members-d1-${stamp}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Start the export and poll until Cloudflare hands over a signed download URL.
body='{"output_format":"polling"}'
resp="$(curl -sf "${auth[@]}" -X POST "${api}/export" -d "${body}")"
bookmark="$(printf '%s' "${resp}" | grep -o '"at_bookmark":"[^"]*"' | cut -d'"' -f4)"

url=""
for _ in $(seq 1 60); do
	resp="$(curl -sf "${auth[@]}" -X POST "${api}/export" \
		-d "{\"output_format\":\"polling\",\"current_bookmark\":\"${bookmark}\"}")"
	url="$(printf '%s' "${resp}" | grep -o '"signed_url":"[^"]*"' | cut -d'"' -f4 || true)"
	[ -n "${url}" ] && break
	sleep 5
done
[ -n "${url}" ] || { echo "export did not finish" >&2; exit 1; }

curl -sf "${url//\\/}" | gzip > "${out}"
gzip -t "${out}"
echo "wrote ${out} ($(du -h "${out}" | cut -f1))"

# Optional second copy to Nextcloud.
if [ -n "${NEXTCLOUD_URL:-}" ]; then
	curl -sf -u "${NEXTCLOUD_USER}:${NEXTCLOUD_PASS}" \
		-T "${out}" "${NEXTCLOUD_URL%/}/$(basename "${out}")"
	echo "uploaded to Nextcloud"
fi

# Local retention.
ls -1t "${BACKUP_DIR}"/members-d1-*.sql.gz 2>/dev/null | tail -n +61 | xargs -r rm --
