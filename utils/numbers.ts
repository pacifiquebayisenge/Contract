export function formatCountToMs(number: number): string {
	return new Intl.NumberFormat('en', {
		notation: 'compact',
		compactDisplay: 'short',
		maximumFractionDigits: 1,
	}).format(number)
}

// round to the nearest 100
export function nearestHundred(num: number): number {
	num = Math.max(100, Math.min(num, 1000)) // clamp between 100 en 1 000
	return Math.round(num / 100) * 100
}
