<template>
	<ClientOnly>
		<div ref="wrap" class="wrap">
			<VChart
				v-if="wrapWidth > 0"
				:option="option"
				:update-options="{ notMerge: true, lazyUpdate: true }"
				autoresize
				class="heatmap"
				:style="{ height: chartHeight }"
			/>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CustomChart } from 'echarts/charts'
import { GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { formatInTimeZone } from 'date-fns-tz'
import { formatStatsTooltip } from '~/utils/statsTooltip'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

use([CanvasRenderer, CustomChart, GridComponent, TooltipComponent, GraphicComponent])

type HeatmapItem = { date: string; count: number; userId: string }
const props = defineProps<{ data: HeatmapItem[] }>()

const themeStore = useThemeStore()
const userStore = useUserStore()

const wrap = ref<HTMLElement | null>(null)
const wrapWidth = ref(0)
watch(wrap, (element, _, onCleanup) => {
	if (!element) return
	const observer = new ResizeObserver(([entry]) => {
		wrapWidth.value = Math.floor(entry?.contentRect.width ?? 0)
	})
	observer.observe(element)
	onCleanup(() => observer.disconnect())
})

function localYYYYMMDD(d: Date) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

function hexToRgb(hex: string) {
	const n = parseInt(hex.replace('#', ''), 16)
	return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function rgbToHex(r: number, g: number, b: number) {
	return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}
function mix(a: string, b: string, t: number) {
	const A = hexToRgb(a)
	const B = hexToRgb(b)
	return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t)
}

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n))
}

const chartHeight = ref('220px')

const option = computed(() => {
	const todayStr = formatInTimeZone(new Date(), 'Europe/Brussels', 'yyyy-MM-dd')
	const [year, month] = todayStr.split('-').map(Number)
	const start = new Date(year, month - 1, 1)
	const daysInMonth = new Date(year, month, 0).getDate()

	// Monday=0..Sunday=6
	const firstDow = (start.getDay() + 6) % 7
	const totalCells = firstDow + daysInMonth
	const weeks = Math.ceil(totalCells / 7)

	const countsByDate = new Map<string, number>()
	for (const item of props.data) {
		countsByDate.set(item.date, (countsByDate.get(item.date) ?? 0) + item.count)
	}

	/* ---------- layout ---------- */
	const sidePadding = 12
	const gap = 6

	const labelArea = 26
	const legendArea = 34
	const extraTopPad = 8
	const extraBottomPad = 14

	const availableWidth = Math.max(0, wrapWidth.value - sidePadding * 2)

	// Fill width but slightly smaller so it breathes
	const rawTile = weeks > 0 ? (availableWidth - gap * (weeks - 1)) / weeks : 10
	const tile = clamp(Math.floor(rawTile * 0.88), 9, 30)
	const radius = clamp(Math.floor(tile * 0.22), 2, 8)

	const gridWidth = tile * weeks + gap * (weeks - 1)
	const gridHeight = tile * 7 + gap * 6

	// Center horizontally
	const extraX = Math.max(0, availableWidth - gridWidth)
	const gridLeft = sidePadding + Math.floor(extraX / 2)

	// Ensure full month visible
	chartHeight.value = `${labelArea + extraTopPad + gridHeight + legendArea + extraBottomPad}px`

	/* ---------- colors (your spec) ---------- */
	const inactiveFill = '#f3f1f6'
	const inactiveBorder = '#eeebf3'

	// 4 shades:
	// 1) current light theme color but a bit lighter
	// 2) current light theme color
	// 3) current light theme color a bit darker
	// 4) current theme color
	const lightBase = themeStore.selectedLightThemeColor
	const base = themeStore.themeColor

	const shade1 = mix(lightBase, '#ffffff', 0.18)
	const shade2 = lightBase
	const shade3 = mix(lightBase, base, 0.22)
	const shade4 = mix(lightBase, base, 0.48)

	function activeColor(totalCount: number) {
		if (totalCount <= 1) return shade1
		if (totalCount <= 25) return shade2
		if (totalCount <= 50) return shade3
		return shade4
	}

	/* ---------- cells ---------- */
	// v = -3 => padding outside month (not drawn)
	// v = -2 => future day (drawn as inactive)
	// v >= 0 => real day value
	const cells: any[] = []
	for (let w = 0; w < weeks; w++) {
		for (let d = 0; d < 7; d++) {
			const idx = w * 7 + d
			const dayOfMonth = idx - firstDow + 1

			if (dayOfMonth < 1 || dayOfMonth > daysInMonth) {
				cells.push([w, d, -3, '', 0]) // outside month: invisible
				continue
			}

			const date = localYYYYMMDD(new Date(year, month - 1, dayOfMonth))
			const isFuture = date > todayStr ? 1 : 0

			if (isFuture) {
				cells.push([w, d, -2, date, 1]) // future: inactive, no tooltip
				continue
			}

			cells.push([w, d, countsByDate.get(date) ?? 0, date, 0])
		}
	}

	/* ---------- legend (non-clickable, centered) ---------- */
	const legendSquares = [
		{ color: inactiveFill },
		{ color: shade1 },
		{ color: shade2 },
		{ color: shade3 },
		{ color: shade4 },
	]

	const legendTile = Math.max(8, Math.floor(tile * 0.55))
	const legendGap = 6

	const lessText = 'Less'
	const moreText = 'More'
	const textW = (s: string) => Math.ceil(s.length * 7) // rough but good enough for centering
	const lessW = textW(lessText)
	const moreW = textW(moreText)

	const squaresW = legendSquares.length * legendTile + (legendSquares.length - 1) * legendGap
	const padBetween = 10

	const centerY = Math.ceil(legendTile / 2)

	return {
		animation: false,

		grid: {
			left: gridLeft,
			right: sidePadding,
			top: labelArea + extraTopPad,
			bottom: legendArea + extraBottomPad,
			containLabel: false,
		},

		graphic: [
			// Month label

			// Legend centered: Less [squares] More
			{
				type: 'group',
				left: 'center',
				bottom: 8,
				silent: true,
				children: [
					{
						type: 'text',
						left: 0,
						top: centerY,
						style: {
							text: lessText,
							fill: 'rgba(27,31,36,0.65)',
							fontSize: 12,
							fontWeight: 500,
							verticalAlign: 'middle',
						},
					},

					...legendSquares.map((sq, i) => ({
						type: 'rect',
						left: lessW + padBetween + i * (legendTile + legendGap),
						top: Math.floor(centerY - (legendTile - 5) / 2) + 5,
						shape: {
							x: 0,
							y: 0,
							width: legendTile - 5,
							height: legendTile - 5,
							r: Math.max(2, Math.floor(legendTile * 0.3)),
						},
						style: {
							fill: sq.color,
							stroke: inactiveBorder,
							lineWidth: 1,
						},
					})),

					{
						type: 'text',
						left: lessW + padBetween + squaresW + padBetween,
						top: centerY,
						style: {
							text: moreText,
							fill: 'rgba(27,31,36,0.65)',
							fontSize: 12,
							fontWeight: 500,
							verticalAlign: 'middle',
						},
					},
				],
			},
		],

		tooltip: {
			triggerOn: 'click',
			renderMode: 'html',
			confine: true,
			formatter: (point: { data?: unknown }) => {
				if (!Array.isArray(point.data)) return ''
				const [, , count, date, future] = point.data
				if (!date || future) return ''
				const label = new Intl.DateTimeFormat('en-GB', {
					day: 'numeric', month: 'short', timeZone: 'UTC',
				}).format(new Date(date))
				const rows = props.data.filter((item) => item.date === date).map((item) => {
					const mine = item.userId === userStore.userId
					return {
						name: userStore.getProfileById(item.userId)?.firstname || (mine ? 'You' : 'Partner'),
						value: item.count,
						color: mine ? themeStore.themeColor : '#f5a96e',
					}
				})
				return formatStatsTooltip(`${label} · ${count} app opens`, rows)
			},
		},

		xAxis: { type: 'value', show: false, min: 0, max: gridWidth },
		yAxis: { type: 'value', show: false, min: 0, max: gridHeight, inverse: false },

		series: [
			{
				type: 'custom',
				data: cells,
				emphasis: { disabled: true },

				renderItem: (params: any, api: any) => {
					const w = api.value(0)
					const d = api.value(1)
					const v = api.value(2)
					const date = api.value(3)
					const isFuture = api.value(4) === 1

					// Outside month: draw nothing
					if (v === -3) return null

					const cs = params.coordSys
					const x = cs.x + w * (tile + gap)
					const y = cs.y + d * (tile + gap)

					const fill =
						!date || isFuture || v === 0 ? inactiveFill : activeColor(v)

					return {
						type: 'rect',
						shape: { x, y, width: tile, height: tile, r: radius },
						style: { fill, stroke: inactiveBorder, lineWidth: 1 },
					}
				},
			},
		],
	}
})
</script>

<style scoped>
.wrap {
	width: 100%;
}
.heatmap {
	width: 100%;
}
</style>
