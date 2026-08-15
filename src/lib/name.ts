/**
 * Yhdistyslaki 11 § requires the complete name of every member in the
 * register, and a Mastodon display name is usually a handle. Rejecting one
 * must not reject a real person: Chinese, Japanese and Korean names are
 * written without a space, so the two-part rule applies to Latin script only.
 */
const PICTOGRAPH = /\p{Extended_Pictographic}/u;
const LATIN = /\p{Script=Latin}/u;
const HANDLE_CHARS = /[@_\d]/;

export function isFullName(value: string, mastodonAcct?: string | null): boolean {
	const name = value.trim();
	if (!name || PICTOGRAPH.test(name) || HANDLE_CHARS.test(name)) return false;
	// The clearest signal available: the register name is the account handle.
	if (mastodonAcct && name.replace(/\s+/g, '').toLowerCase() === mastodonAcct.toLowerCase())
		return false;

	const parts = name.split(/\s+/).filter((part) => part.length >= 2);
	if (parts.length >= 2) return true;
	return !LATIN.test(name) && name.length >= 2;
}
