export const adjustColor = (color: string, amount: number): string => {
	const hex = color.replace(/^.*?(#[0-9a-fA-F]{6}).*$/, '$1').replace('#', '')
	const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
	const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
	const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
