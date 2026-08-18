/** kB below a megabyte, one decimal above it, with a Finnish decimal comma. */
export const fileSize = (bytes: number) =>
	bytes >= 1024 * 1024
		? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
		: `${Math.round(bytes / 1024)} kB`;
