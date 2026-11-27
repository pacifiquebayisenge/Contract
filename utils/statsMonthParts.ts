const monthNames = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' })

export function getMonthParts(days: string[]) {
	const parts: { label: string; firstIndex: number; lastIndex: number }[] = []
	let previousKey = ''

	days.forEach((day, index) => {
		const part = Math.min(4, Math.ceil(Number(day.slice(8, 10)) / 7))
		const key = `${day.slice(0, 7)}:${part}`

		if (key === previousKey) {
			parts[parts.length - 1].lastIndex = index
			return
		}

		parts.push({
			label: `${monthNames.format(new Date(day))} - Q${part}`,
			firstIndex: index,
			lastIndex: index,
		})
		previousKey = key
	})

	return parts
}
