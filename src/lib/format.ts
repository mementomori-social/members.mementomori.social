/** kB below a megabyte, one decimal above it, with a Finnish decimal comma. */
export const fileSize = (bytes: number) =>
	bytes >= 1024 * 1024
		? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
		: `${Math.round(bytes / 1024)} kB`;

const euros = new Intl.NumberFormat('fi-FI', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/** Finnish money format: space for thousands, decimal comma, "4 034,50". */
export const eur = (amount: number) => euros.format(amount);
