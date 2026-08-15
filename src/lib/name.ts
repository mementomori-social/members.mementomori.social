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
	const parts = name.split(/\s+/).filter((part) => part.length >= 2);
	// Two parts is a name, even when the handle happens to look the same:
	// plenty of people use FirstnameLastname as their account name.
	if (parts.length >= 2) return true;
	// A lone word that is exactly the handle is the handle, not a name.
	if (mastodonAcct && name.toLowerCase() === mastodonAcct.toLowerCase()) return false;
	return !LATIN.test(name) && name.length >= 2;
}
