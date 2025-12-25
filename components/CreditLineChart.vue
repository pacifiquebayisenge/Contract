<template>
	<ClientOnly>
		<VChart :option="option" autoresize style="height: 300px; width: 100%" />
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { formatCountToMs } from '~/utils/formatCountToMs'

type CreditPoint = [string, number]
type CreditSeries = { userId: string; data: CreditPoint[] }

const props = defineProps<{
	data: CreditSeries[]
}>()

const themeStore = useThemeStore()
const userStore = useUserStore()

function formatDDMMYYYY(dateInput: string | number | Date) {
	const d = new Date(dateInput)
	const dd = String(d.getDate()).padStart(2, '0')
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const yyyy = d.getFullYear()
	return `${dd}-${mm}-${yyyy}`
}

function isInCurrentMonth(dateInput: string) {
	const d = new Date(dateInput)
	const now = new Date()
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

const option = computed(() => {
	const myId = userStore.userId
	const myColor = themeStore.getCurrentLightThemeColor
	const otherColor = '#ffb780'

	// 🔹 Build + sort series so "me" is always first
	const chartSeries = props.data
		.map((s) => {
			const isMe = s.userId === myId
			const name = userStore.getProfileById(s.userId)?.firstname ?? (isMe ? 'Me' : 'Partner')

			const color = isMe ? myColor : otherColor

			const filtered = (s.data || [])
				.filter(([ts]) => isInCurrentMonth(ts))
				.slice()
				.sort((a, b) => String(a[0]).localeCompare(String(b[0])))

			return {
				userId: s.userId,
				isMe,
				name,
				type: 'line',
				smooth: false,
				connectNulls: false,
				data: filtered,
				lineStyle: { width: 3, color },
				itemStyle: { color },
				showSymbol: true,
				symbol: 'circle',
				symbolSize: 7,
			}
		})
		.sort((a, b) => Number(b.isMe) - Number(a.isMe)) // ✅ me first

	return {
		animation: false,

		// 🔹 extra bottom space for centered legend
		grid: { left: 26, right: 16, top: 24, bottom: 72 },

		xAxis: {
			type: 'time',
			axisLabel: { show: false },
			axisTick: { show: false },
			axisLine: { show: false },
			splitLine: { show: false },
		},

		yAxis: {
			type: 'value',
			axisLabel: { color: 'rgba(27,31,36,0.65)', formatter: (v: number) => formatCountToMs(v) }, // ✅ compact numbers
			splitLine: { lineStyle: { color: 'rgba(27,31,36,0.08)' } },
			axisLine: { show: false },
			axisTick: { show: false },
		},

		// 🔹 centered legend at bottom
		legend: {
			bottom: 14,
			left: 'center',
			selectedMode: false,
			itemGap: 28,
			itemWidth: 14,
			itemHeight: 14,
			icon: 'roundRect',
			textStyle: {
				color: 'rgba(27,31,36,0.65)',
				fontSize: 12,
				padding: [0, 0, 0, 6],
			},
			data: chartSeries.map((s: any) => s.name),
		},

		tooltip: {
			trigger: 'item',
			triggerOn: 'click',
			axisPointer: { type: 'none' },

			backgroundColor: 'transparent',
			borderWidth: 0,
			padding: 0,
			extraCssText: 'box-shadow:none;',

			formatter: (p: any) => {
				const x = p.data?.[0]
				const y = p.data?.[1]
				if (x == null) return ''

				const borderColor = p.color || 'rgba(27,31,36,0.18)'
				const dateStr = formatDDMMYYYY(x)

				return `
					<div style="
						text-align:center;
						background:rgba(255,255,255,0.94);
						border:1px solid ${borderColor};
						border-radius:12px;
						padding:10px 14px;
						box-shadow:0 8px 20px rgba(0,0,0,0.08);
					">
						<div style="font-weight:600; margin-bottom:2px;">
							${p.seriesName}
						</div>
						<div style="font-size:11px; opacity:0.75; margin-bottom:6px;">
							${dateStr}
						</div>
						<div style="font-weight:700;">
						€	${Number(y).toLocaleString()} 
						</div>
					</div>
				`
			},
		},

		series: chartSeries,
	}
})
</script>
