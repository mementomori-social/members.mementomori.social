/**
 * Yhdistyslaki 11 § asks for the home municipality, not a postal address, and
 * the register is visible to every member, so a street address entered here
 * would publish someone's home to the whole association.
 */

/**
 * Only endings that cannot appear in a municipality name: "mäki" and "ranta"
 * are out, or Riihimäki and Pyhäranta would be rejected.
 */
const STREET_ENDING =
	/(katu|kuja|polku|väylä|raitti|penger|gatan|vägen|gränd|street|road|avenue|boulevard)$/i;

export function isMunicipality(value: string): boolean {
	const name = value.trim();
	if (!name || name.length > 60) return false;
	// House numbers and postal codes are what make an address an address;
	// no municipality name contains a digit.
	if (/\d/.test(name)) return false;
	// Separators belong to address lines, not to place names.
	if (/[,;/]/.test(name)) return false;
	const words = name.split(/\s+/);
	// "New York" and "Sankt Pölten" are real; a six-word line is an address.
	if (words.length > 5) return false;
	// A leading street name with the municipality after it ("Multisillankatu
	// Tampere") has no digits to catch it.
	if (words.length > 1 && STREET_ENDING.test(words[0])) return false;
	return /\p{L}/u.test(name) && words.every((w) => w.length <= 30);
}
