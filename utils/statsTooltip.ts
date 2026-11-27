type TooltipRow = {
	name: string
	value: number | null
	color: string
}

const numberFormatter = new Intl.NumberFormat('en-US')

function escapeText(text: string) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function formatStatsTooltip(title: string, rows: TooltipRow[]) {
	const content = rows.map(({ name, value, color }) => {
		const marker = /^#[0-9a-f]{6}$/i.test(color) ? color : '#94a3b8'
		const amount = value === null ? '—' : numberFormatter.format(value).replace(/,/g, ' ')
		return `<div style="display:flex;align-items:center;gap:8px">
			<span style="width:8px;height:8px;border-radius:50%;background:${marker};flex:none"></span>
			<span style="overflow-wrap:anywhere">${escapeText(name)}</span>
			<strong style="margin-left:auto;padding-left:14px;text-align:right;white-space:nowrap">${amount}</strong>
		</div>`
	}).join('')

	return `<div style="min-width:122px;max-width:200px">
		<div style="text-align:center;font-weight:600;margin-bottom:10px">${escapeText(title)}</div>
		<div style="display:grid;gap:4px">${content}</div>
	</div>`
}

export function formatStatsAxisTooltip(input: unknown) {
	if (!Array.isArray(input) || !input.length) return ''

	const title = String(input[0]?.axisValue ?? '')
	const rows = input.filter((point) => typeof point.seriesName === 'string').map((point) => ({
		name: point.seriesName,
		value: typeof point.data === 'number' ? point.data : null,
		color: typeof point.color === 'string' ? point.color : '',
	}))

	return formatStatsTooltip(title, rows)
}
