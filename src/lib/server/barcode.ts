/**
 * Finnish virtual bank barcode (virtuaaliviivakoodi), pankkiviivakoodi
 * symbol version 4: account in IBAN form, reference in national form.
 * 54 digits: '4' + IBAN numeric part (16) + euros (6) + cents (2) + '000'
 * + reference zero-padded (20) + due date VVKKPP or '000000'.
 * Source: Finanssiala, Pankkiviivakoodi-opas 5.3.
 */
export function virtualBarcode(iban: string, amountEur: number, viite: string): string | null {
	const numeric = iban.replace(/\s/g, '').toUpperCase();
	if (!/^FI\d{16}$/.test(numeric)) return null;

	const cents = Math.round(amountEur * 100);
	if (!Number.isFinite(cents) || cents < 0 || cents > 99999999) return null;

	const euros = Math.floor(cents / 100)
		.toString()
		.padStart(6, '0');
	const centPart = (cents % 100).toString().padStart(2, '0');
	const reference = viite.replace(/\s/g, '');
	if (!/^\d{1,20}$/.test(reference)) return null;

	return `4${numeric.slice(2)}${euros}${centPart}000${reference.padStart(20, '0')}000000`;
}
