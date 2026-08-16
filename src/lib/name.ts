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
	// The register needs a complete name, so initials do not count as a name
	// part: a part qualifies with two or more letters ("Jan", "Bo"), while
	// "J." or "T." has one. Two qualifying parts make a name; punctuation is
	// ignored so "J. T." cannot sneak through on the dots.
	const letters = (part: string) => (part.match(/\p{L}/gu) ?? []).length;
	const parts = name.split(/\s+/).filter((part) => letters(part) >= 2);
	if (parts.length >= 2) return true;
	// A lone word that is exactly the handle is the handle, not a name.
	if (mastodonAcct && name.toLowerCase() === mastodonAcct.toLowerCase()) return false;
	return !LATIN.test(name) && name.length >= 2;
}
