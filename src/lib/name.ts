/**
 * Yhdistyslaki 11 § requires the complete name of every member in the
 * register. A Mastodon display name is usually a handle or a nickname, so the
 * register never takes one: a name needs at least two parts and no pictographs.
 */
const PICTOGRAPH = /\p{Extended_Pictographic}/u;

export function isFullName(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed || PICTOGRAPH.test(trimmed)) return false;
	return trimmed.split(/\s+/).filter((part) => part.length >= 2).length >= 2;
}
