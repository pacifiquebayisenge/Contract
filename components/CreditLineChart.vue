<template>
	<ClientOnly>
		<VChart :option="option" autoresize style="height: 280px; width: 100%" />
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

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
	const otherColor = '#ff7a18'

	const chartSeries = props.data.map((s) => {
		const name = userStore.getProfileById(s.userId)?.firstname ?? 'Unknown'
		const isMe = s.userId === myId
		const color = isMe ? myColor : otherColor

		// ✅ only current month, sorted, NO zero fill
		const filtered = (s.data || [])
			.filter(([ts]) => isInCurrentMonth(ts))
			.slice()
			.sort((a, b) => String(a[0]).localeCompare(String(b[0])))

		return {
			name,
			type: 'line',
			smooth: false,
			connectNulls: false, // ✅ don’t bridge gaps
			data: filtered,
			lineStyle: { width: 3, color },
			itemStyle: { color },
			showSymbol: true,
			symbol: 'circle',
			symbolSize: 7,
		}
	})

	return {
		animation: false,

		grid: { left: 26, right: 16, top: 24, bottom: 54 },

		xAxis: {
			type: 'time',
			axisLabel: { show: false },
			axisTick: { show: false },
			axisLine: { show: false },
			splitLine: { show: false },
		},

		yAxis: {
			type: 'value',
			axisLabel: { color: 'rgba(27,31,36,0.65)' },
			splitLine: { lineStyle: { color: 'rgba(27,31,36,0.08)' } },
			axisLine: { show: false },
			axisTick: { show: false },
		},

		legend: {
			bottom: 10,
			left: 34,
			selectedMode: false,
			itemGap: 20,
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
              ${Number(y).toLocaleString()} €
            </div>
          </div>
        `
			},
		},

		series: chartSeries,
	}
})
</script>
