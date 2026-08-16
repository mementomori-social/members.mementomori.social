/**
 * Bank statement CSV parsing for the board's import. Holvi does not document
 * its export columns publicly, so headers are matched against Finnish and
 * English candidates and the board always sees a preview before anything is
 * written. Rows without a bank transaction id get a stable digest instead, so
 * re-importing an overlapping file can never record a payment twice.
 */

export type StatementRow = {
	txId: string;
	dateIso: string;
	amountEur: number;
	reference: string;
	counterparty: string;
};

const HEADERS = {
	date: [
		'payment date',
		'maksupäivä',
		'date',
		'päivämäärä',
		'value date',
		'arvopäivä',
		'kirjauspäivä'
	],
	amount: ['amount (eur)', 'amount', 'määrä', 'summa'],
	reference: ['reference', 'viitenumero', 'viite', 'rf reference'],
	message: ['message', 'viesti', 'description', 'kuvaus'],
	counterparty: ['counterparty', 'payer', 'maksaja', 'name', 'nimi', 'saaja/maksaja'],
	txId: ['filing id', 'arkistointitunnus', 'transaction id', 'archival id', 'id']
} as const;

/** Small CSV reader: quoted fields, embedded separators, CRLF. */
function parseCsv(text: string, sep: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quoted) {
			if (c === '"' && text[i + 1] === '"') {
				field += '"';
				i++;
			} else if (c === '"') quoted = false;
			else field += c;
		} else if (c === '"') quoted = true;
		else if (c === sep) {
			row.push(field);
			field = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field);
			field = '';
			if (row.some((f) => f.trim() !== '')) rows.push(row);
			row = [];
		} else field += c;
	}
	row.push(field);
	if (row.some((f) => f.trim() !== '')) rows.push(row);
	return rows;
}

const pick = (headers: string[], names: readonly string[]) => {
	for (const name of names) {
		const i = headers.findIndex((h) => h === name);
		if (i !== -1) return i;
	}
	for (const name of names) {
		const i = headers.findIndex((h) => h.includes(name));
		if (i !== -1) return i;
	}
	return -1;
};

function parseAmount(raw: string): number | null {
	const cleaned = raw.replace(/\s|€|EUR/gi, '').replace(/\.(?=\d{3}(\D|$))/g, '');
	const normalised = cleaned.replace(',', '.');
	const n = Number(normalised);
	return Number.isFinite(n) ? n : null;
}

function parseDate(raw: string): string | null {
	const fi = raw.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
	if (fi) return `${fi[3]}-${fi[2].padStart(2, '0')}-${fi[1].padStart(2, '0')}`;
	const iso = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
	if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
	return null;
}

async function digest(parts: string[]): Promise<string> {
	const data = new TextEncoder().encode(parts.join('|'));
	const hash = await crypto.subtle.digest('SHA-256', data);
	return (
		'digest-' +
		[...new Uint8Array(hash)]
			.slice(0, 16)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
	);
}

export async function parseStatement(
	text: string
): Promise<{ rows: StatementRow[]; problem: string | null }> {
	const sep = (text.split('\n')[0]?.match(/;/g)?.length ?? 0) >= 1 ? ';' : ',';
	const table = parseCsv(text.replace(/^﻿/, ''), sep);
	if (table.length < 2) return { rows: [], problem: 'empty' };

	const headers = table[0].map((h) => h.trim().toLowerCase());
	const col = {
		date: pick(headers, HEADERS.date),
		amount: pick(headers, HEADERS.amount),
		reference: pick(headers, HEADERS.reference),
		message: pick(headers, HEADERS.message),
		counterparty: pick(headers, HEADERS.counterparty),
		txId: pick(headers, HEADERS.txId)
	};
	if (col.date === -1 || col.amount === -1)
		return { rows: [], problem: table[0].map((h) => h.trim()).join(', ') };

	const rows: StatementRow[] = [];
	for (const r of table.slice(1)) {
		const dateIso = parseDate(r[col.date] ?? '');
		const amountEur = parseAmount(r[col.amount] ?? '');
		if (!dateIso || amountEur === null) continue;
		const message = col.message !== -1 ? (r[col.message] ?? '').trim() : '';
		let reference = col.reference !== -1 ? (r[col.reference] ?? '').trim() : '';
		// Holvi merges the filing id into the description; a bare digit run in
		// the message works as a reference fallback.
		if (!reference) reference = (message.match(/\b(\d{4,20})\b/) ?? ['', ''])[1];
		const counterparty = col.counterparty !== -1 ? (r[col.counterparty] ?? '').trim() : '';
		const explicitId = col.txId !== -1 ? (r[col.txId] ?? '').trim() : '';
		const txId =
			explicitId || (await digest([dateIso, String(amountEur), reference, counterparty, message]));
		rows.push({ txId, dateIso, amountEur, reference: reference.replace(/\s/g, ''), counterparty });
	}
	return { rows, problem: null };
}
