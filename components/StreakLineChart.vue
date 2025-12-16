<template>
	<ClientOnly>
		<VChart :option="option" autoresize style="height: 280px; width: 100%" />
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

type Item = { day: string; count: number }
type Series = { userId: string; data: Item[] }

const props = defineProps<{
	data: Series[]
}>()

const themeStore = useThemeStore()
const userStore = useUserStore()

function localYYYYMMDD(d: Date) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

// numeric day index (for x-axis as value scale)
function dayIndex(dateStr: string) {
	const d = new Date(dateStr + 'T00:00:00')
	return Math.floor(+d / 86400000)
}

function currentMonthBounds() {
	const now = new Date()
	const start = new Date(now.getFullYear(), now.getMonth(), 1)
	const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
	return {
		start,
		end,
		min: Math.floor(+start / 86400000),
		max: Math.floor((+end - 1) / 86400000),
	}
}

const option = computed(() => {
	const { start, end, min, max } = currentMonthBounds()

	const myId = userStore.userId
	const myColor = themeStore.getCurrentLightThemeColor // ✅ light theme color
	const otherColor = '#ff7a18' // ✅ vibrant orange
	const thresholdColor = '#ff2d2d' // ✅ vibrant red

	// Build user series (only points that exist; no zero-fill)
	const userLineSeries = props.data.map((s) => {
		const name = userStore.getProfileById(s.userId)?.firstname ?? 'Unknown'
		const isMe = s.userId === myId
		const color = isMe ? myColor : otherColor

		const points = (s.data || [])
			.filter((p) => {
				const d = new Date(p.day + 'T00:00:00')
				return d >= start && d < end
			})
			.sort((a, b) => a.day.localeCompare(b.day))
			.map((p) => [dayIndex(p.day), p.count])

		return {
			name,
			type: 'line',
			data: points,
			smooth: false, // ✅ straight lines
			connectNulls: false, // ✅ keep gaps
			showSymbol: true,
			symbol: 'circle',
			symbolSize: 7,
			lineStyle: { width: 3, color },
			itemStyle: { color },
			emphasis: { focus: 'series' },
		}
	})

	// Dynamic y max (still at least enough to show threshold=3)
	const allY = userLineSeries.flatMap((s: any) => s.data.map((p: any) => p[1]))
	const yMax = Math.max(6, Math.max(3, ...allY) + 1)

	return {
		animation: false,

		tooltip: {
			trigger: 'item',
			triggerOn: 'click',
			axisPointer: { type: 'none' },

			// ✅ make the outer ECharts tooltip "invisible"
			backgroundColor: 'transparent',
			borderWidth: 0,
			padding: 0,
			extraCssText: 'box-shadow:none;',

			// (optional) keep it from showing when clicking empty areas
			showContent: true,

			formatter: (p: any) => {
				const [x, y] = p.data || []
				if (x == null) return ''

				const d = new Date(x * 86400000)
				const dd = String(d.getDate()).padStart(2, '0')
				const mm = String(d.getMonth() + 1).padStart(2, '0')
				const yyyy = d.getFullYear()

				const borderColor = p.color || 'rgba(27,31,36,0.18)'

				// ✅ ONLY ONE BOX (this one)
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
          ${dd}-${mm}-${yyyy}
        </div>
        <div style="font-weight:700;">
          ${y} streak${y === 1 ? '' : 's'}
        </div>
      </div>
    `
			},
		},

		// ✅ more space between chart and legend
		grid: { left: 26, right: 16, top: 24, bottom: 54 },

		// ✅ remove day numbers at bottom
		xAxis: {
			type: 'value',
			min,
			max,
			axisLabel: { show: false },
			axisTick: { show: false },
			axisLine: { show: false },
			splitLine: { show: false },
		},

		yAxis: {
			type: 'value',
			min: 0,
			max: yMax,
			axisLabel: { color: 'rgba(27,31,36,0.65)' },
			splitLine: { lineStyle: { color: 'rgba(27,31,36,0.08)' } },
			axisLine: { show: false },
			axisTick: { show: false },
		},

		// ✅ bottom legend, rounded squares, NOT clickable
		legend: {
			bottom: 10,
			left: 34, // ✅ extra left spacing
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
			// ✅ show only user lines (exclude limit)
			data: userLineSeries.map((s: any) => s.name),
		},

		series: [
			...userLineSeries,

			// ✅ limit line exists but is NOT in legend
			{
				name: '__limit__',
				type: 'line',
				data: [
					[min, 3],
					[max, 3],
				],
				symbol: 'none',
				silent: true,
				lineStyle: { type: 'dashed', width: 2, color: thresholdColor },
				emphasis: { disabled: true },
			},
		],
	}
})
</script>
