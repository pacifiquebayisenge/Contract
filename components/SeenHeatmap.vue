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

	// lookup
	const valueByDate = new Map<string, number>()
	for (const item of props.data || []) {
		valueByDate.set(item.date, Number(item.count) || 0)
	}

	// ---- layout ----
	const sidePadding = 12
	const gap = 6

	// space for month label + legend
	const labelArea = 26
	const legendArea = 24
	const extraTopPad = 8
	const extraBottomPad = 24

	const availableWidth = Math.max(0, wrapWidth.value - sidePadding * 2)

	// Tile fills width, but slightly smaller (so it breathes)
	const rawTile = weeks > 0 ? (availableWidth - gap * (weeks - 1)) / weeks : 10
	const tile = Math.max(9, Math.floor(rawTile * 0.88)) // <- smaller
	const radius = clamp(Math.floor(tile * 0.22), 2, 8)

	const legendTile = Math.max(8, Math.floor(tile * 0.55))
	const legendGap = 6

	const gridWidth = tile * weeks + gap * (weeks - 1)
	const gridHeight = tile * 7 + gap * 6

	// Center grid horizontally
	const extraX = Math.max(0, availableWidth - gridWidth)
	const gridLeft = sidePadding + Math.floor(extraX / 2)

	// Chart height to ALWAYS show full month (7 rows)
	chartHeight.value = `${labelArea + extraTopPad + gridHeight + legendArea + extraBottomPad}px`

	// ---- colors (your spec) ----
	const inactiveFill = '#eff2f5'
	const inactiveBorder = '#e4e7eb'

	const lightBase = themeStore.getCurrentLightThemeColor
	const base = themeStore.getCurrentThemeColor

	const shade1 = mix(lightBase, '#ffffff', 0.18) // light, a bit lighter
	const shade2 = lightBase // light
	const shade3 = mix(lightBase, '#000000', 0.1) // light, a bit darker
	const shade4 = base // theme base

	function activeColor(v: number) {
		if (v <= 1) return shade1
		if (v <= 3) return shade2
		if (v <= 6) return shade3
		return shade4
	}

	// ---- build cells ----
	// We do NOT draw padding outside the month at all (no “35 days” look)
	// Values:
	//  -3 => padding (invisible)
	//  -2 => future day (real day, but inactive)
	// >=0 => real count
	const cells: any[] = []
	for (let w = 0; w < weeks; w++) {
		for (let d = 0; d < 7; d++) {
			const idx = w * 7 + d
			const dayOfMonth = idx - firstDow + 1

			if (dayOfMonth < 1 || dayOfMonth > daysInMonth) {
				cells.push([w, d, -3, '', 0]) // invisible padding
				continue
			}

			const date = localYYYYMMDD(new Date(year, month, dayOfMonth))
			const isFuture = date > todayStr ? 1 : 0

			// future days: show as inactive style, but no tooltip
			if (isFuture) {
				cells.push([w, d, -2, date, 1])
				continue
			}

			const value = valueByDate.get(date) ?? 0
			cells.push([w, d, value, date, 0])
		}
	}

	// ---- legend (non-clickable) ----
	const legendSquares = [
		{ color: inactiveFill }, // 0
		{ color: shade1 },
		{ color: shade2 },
		{ color: shade3 },
		{ color: shade4 },
	]

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

			// Legend: "Less [□ □ □ □ □] More" (NOT clickable)
			{
				type: 'group',
				right: sidePadding,
				bottom: 8,
				silent: true,
				children: [
					{
						type: 'text',
						left: 0,
						top: 0,
						style: { text: 'Less', fill: 'rgba(27,31,36,0.65)', fontSize: 12 },
					},
					...legendSquares.map((sq, i) => ({
						type: 'rect',
						left: 34 + i * (legendTile + legendGap),
						top: 1, // aligns with text baseline
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
						left: 34 + legendSquares.length * (tile * 0.75 + 6) + 6,
						top: 0,
						style: { text: 'More', fill: 'rgba(27,31,36,0.65)', fontSize: 12 },
					},
				],
			},
		],

		// Subtle tooltip on click (no hover)
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

					// padding outside the month: draw nothing (cut where it should)
					if (v === -3) return null

					const cs = params.coordSys
					const x = cs.x + w * (tile + gap)
					const y = cs.y + d * (tile + gap)

					// future days + zero days => inactive style
					const fill = !date || isFuture || v === 0 ? inactiveFill : activeColor(v)

					return {
						type: 'rect',
						shape: { x, y, width: tile, height: tile, r: radius },
						style: {
							fill,
							stroke: inactiveBorder,
							lineWidth: 1,
						},
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
