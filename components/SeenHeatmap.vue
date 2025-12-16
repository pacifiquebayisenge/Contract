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

// expose computed height to template
const chartHeight = ref('190px')

const option = computed(() => {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth()
	const monthLabel = now.toLocaleString(undefined, { month: 'long' })
	const todayStr = localYYYYMMDD(now)

	const start = new Date(year, month, 1)
	const end = new Date(year, month + 1, 1)
	const daysInMonth = Math.round((+end - +start) / 86400000)

	const firstDow = (start.getDay() + 6) % 7
	const totalCells = firstDow + daysInMonth
	const weeks = Math.ceil(totalCells / 7)

	// lookup
	const valueByDate = new Map<string, number>()
	for (const item of props.data || []) {
		valueByDate.set(item.date, Number(item.count) || 0)
	}

	// layout
	const sidePadding = 12
	const topLabel = 26
	const bottomPad = 14 // padding under legend row
	const bottomLegendRow = 22
	const gap = 6 // more GitHub-like breathing

	const availableWidth = Math.max(0, wrapWidth.value - sidePadding * 2)

	// tile fills width
	const rawTile = weeks > 0 ? (availableWidth - gap * (weeks - 1)) / weeks : 10
	const tile = Math.max(10, Math.floor(rawTile)) // keep it reasonably sized
	const radius = clamp(Math.floor(tile * 0.22), 2, 8)

	const gridWidth = tile * weeks + gap * (weeks - 1)
	const gridHeight = tile * 7 + gap * 6

	// IMPORTANT: ensure container is tall enough (shows ALL 7 rows)
	chartHeight.value = `${topLabel + gridHeight + bottomLegendRow + bottomPad}px`

	// colors (your spec)
	const inactiveFill = '#eff2f5'
	const inactiveBorder = '#e4e7eb'

	const lightBase = themeStore.getCurrentLightThemeColor
	const base = themeStore.getCurrentThemeColor

	const s1 = mix(lightBase, '#ffffff', 0.25) // slightly lighter than light
	const s2 = lightBase // light
	const s3 = mix(lightBase, '#000000', 0.12) // slightly darker than light
	const s4 = base // theme base

	function activeColor(v: number) {
		if (v <= 1) return s1
		if (v <= 3) return s2
		if (v <= 6) return s3
		return s4
	}

	// cells
	const cells: any[] = []
	for (let w = 0; w < weeks; w++) {
		for (let d = 0; d < 7; d++) {
			const idx = w * 7 + d
			const dayOfMonth = idx - firstDow + 1

			if (dayOfMonth < 1 || dayOfMonth > daysInMonth) {
				cells.push([w, d, 0, '', 0]) // padding (still shown as inactive)
				continue
			}

			const date = localYYYYMMDD(new Date(year, month, dayOfMonth))
			const isFuture = date > todayStr ? 1 : 0
			const value = isFuture ? 0 : (valueByDate.get(date) ?? 0)

			cells.push([w, d, value, date, isFuture])
		}
	}

	return {
		animation: false,

		grid: {
			left: sidePadding,
			right: sidePadding,
			top: topLabel,
			bottom: bottomLegendRow + bottomPad,
			containLabel: false,
		},

		graphic: [
			{
				type: 'text',
				left: sidePadding,
				top: 4,
				style: {
					text: monthLabel,
					fontSize: 12,
					fontWeight: 600,
					fill: 'rgba(27,31,36,0.70)',
				},
				silent: true,
			},
		],

		tooltip: {
			triggerOn: 'click',
			backgroundColor: 'rgba(255,255,255,0.92)',
			borderColor: 'rgba(27,31,36,0.10)',
			borderWidth: 1,
			padding: [8, 10],
			textStyle: { fontSize: 12 },
			extraCssText: 'border-radius:10px; box-shadow: 0 8px 20px rgba(0,0,0,0.08);',
			formatter: (p: any) => {
				const date = p.data?.[3]
				const v = p.data?.[2]
				const isFuture = p.data?.[4] === 1
				if (!date || isFuture) return ''
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
