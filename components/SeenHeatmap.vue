<template>
	<ClientOnly>
		<div ref="wrap" class="wrap">
			<VChart
				v-if="ready && wrapWidth > 0"
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { CustomChart } from 'echarts/charts'
import { GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useThemeStore } from '~/stores/theme'

use([CanvasRenderer, CustomChart, GridComponent, TooltipComponent, GraphicComponent])

type HeatmapItem = { date: string; count: number }
const props = defineProps<{ data: HeatmapItem[] }>()

const themeStore = useThemeStore()
const ready = ref(false)

const wrap = ref<HTMLElement | null>(null)
const wrapWidth = ref(0)
let ro: ResizeObserver | null = null

onMounted(async () => {
	await nextTick()
	ready.value = true

	if (process.client && wrap.value) {
		ro = new ResizeObserver((entries) => {
			wrapWidth.value = Math.floor(entries[0]?.contentRect?.width ?? 0)
		})
		ro.observe(wrap.value)
	}
})

onBeforeUnmount(() => {
	if (ro && wrap.value) ro.unobserve(wrap.value)
	ro = null
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
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth()
	const monthLabel = now.toLocaleString(undefined, { month: 'long' })
	const todayStr = localYYYYMMDD(now)

	const start = new Date(year, month, 1)
	const end = new Date(year, month + 1, 1)
	const daysInMonth = Math.round((+end - +start) / 86400000)

	// Monday=0..Sunday=6
	const firstDow = (start.getDay() + 6) % 7
	const totalCells = firstDow + daysInMonth
	const weeks = Math.ceil(totalCells / 7)

	// Lookup: date -> count
	const valueByDate = new Map<string, number>()
	for (const item of props.data || []) {
		valueByDate.set(item.date, Number(item.count) || 0)
	}

	/* ---------- layout ---------- */
	const sidePadding = 12
	const gap = 8 // a bit more spacing between tiles

	const labelArea = 26
	const legendArea = 34
	const extraTopPad = 8
	const extraBottomPad = 14

	const availableWidth = Math.max(0, wrapWidth.value - sidePadding * 2)

	// Fill width but slightly smaller so it breathes
	const rawTile = weeks > 0 ? (availableWidth - gap * (weeks - 1)) / weeks : 10
	const tile = Math.max(9, Math.floor(rawTile * 0.88))
	const radius = clamp(Math.floor(tile * 0.22), 2, 8)

	const gridWidth = tile * weeks + gap * (weeks - 1)
	const gridHeight = tile * 7 + gap * 6

	// Center horizontally
	const extraX = Math.max(0, availableWidth - gridWidth)
	const gridLeft = sidePadding + Math.floor(extraX / 2)

	// Ensure full month visible
	chartHeight.value = `${labelArea + extraTopPad + gridHeight + legendArea + extraBottomPad}px`

	/* ---------- colors (your spec) ---------- */
	const inactiveFill = '#eff2f5'
	const inactiveBorder = '#e4e7eb'

	// 4 shades:
	// 1) current light theme color but a bit lighter
	// 2) current light theme color
	// 3) current light theme color a bit darker
	// 4) current theme color
	const lightBase = themeStore.getCurrentLightThemeColor
	const base = themeStore.getCurrentThemeColor

	const shade1 = mix(lightBase, '#ffffff', 0.18)
	const shade2 = lightBase
	const shade3 = mix(lightBase, '#000000', 0.1)
	const shade4 = base

	function activeColor(v: number) {
		if (v <= 1) return shade1
		if (v <= 3) return shade2
		if (v <= 6) return shade3
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

			const date = localYYYYMMDD(new Date(year, month, dayOfMonth))
			const isFuture = date > todayStr ? 1 : 0

			if (isFuture) {
				cells.push([w, d, -2, date, 1]) // future: inactive, no tooltip
				continue
			}

			const value = valueByDate.get(date) ?? 0
			cells.push([w, d, value, date, 0])
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
			{
				type: 'text',
				left: gridLeft,
				top: 6,
				style: {
					text: monthLabel,
					fontSize: 12,
					fontWeight: 600,
					fill: 'rgba(27,31,36,0.70)',
				},
				silent: true,
			},

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
						top: 0,
						shape: {
							x: 0,
							y: 0,
							width: legendTile,
							height: legendTile,
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

		// Subtle tooltip on click only
		tooltip: {
			triggerOn: 'click',
			backgroundColor: 'rgba(255,255,255,0.92)',
			borderColor: 'rgba(27,31,36,0.10)',
			borderWidth: 1,
			padding: [8, 10],
			textStyle: { fontSize: 12, color: 'rgba(27,31,36,0.80)' },
			extraCssText: 'border-radius:10px; box-shadow: 0 8px 20px rgba(0,0,0,0.08);',
			formatter: (p: any) => {
				const date = p.data?.[3]
				const v = p.data?.[2]
				const isFuture = p.data?.[4] === 1
				const isPadding = v === -3
				if (!date || isFuture || isPadding) return ''
				return `${date}<br/>${v} app opens`
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

					const fill = !date || isFuture || v === 0 ? inactiveFill : activeColor(v)

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
