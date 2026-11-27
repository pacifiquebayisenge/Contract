<template>
	<ClientOnly>
		<VChart :option="option" autoresize class="stats-chart" />
	</ClientOnly>
</template>

<script setup lang="ts">
import { getMonthParts } from '~/utils/statsMonthParts'
import type { StatsSeries } from '~/composables/useStats'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { formatCountToMs } from '~/utils/numbers'

const props = defineProps<{ days: string[]; data: StatsSeries[] }>()
const themeStore = useThemeStore()
const userStore = useUserStore()
const amounts = new Intl.NumberFormat('en-US')

const parts = computed(() => getMonthParts(props.days))

const option = computed(() => ({
	animation: false,
	grid: { left: 48, right: 12, top: 18, bottom: 64 },
	legend: {
		bottom: 5,
		type: 'scroll',
		icon: 'roundRect',
		itemWidth: 12,
		itemHeight: 7,
		textStyle: { color: '#667085' },
	},
	tooltip: {
		trigger: 'axis',
		renderMode: 'richText',
		confine: true,
		valueFormatter: (value: unknown) =>
			typeof value === 'number' ? amounts.format(value).replace(/,/g, ' ') : '—',
	},
	xAxis: {
		type: 'category',
		data: parts.value.map(({ label }) => label),
		axisLabel: {
			formatter: (label: string) => label.replace(' - ', '\n'),
			fontSize: 10,
			hideOverlap: true,
			margin: 10,
			color: '#667085',
		},
		axisLine: { show: false },
		axisTick: { show: false },
	},
	yAxis: {
		type: 'value',
		scale: true,
		axisLabel: { color: '#667085', formatter: (value: number) => formatCountToMs(value) },
		splitNumber: 3,
		splitLine: { lineStyle: { color: '#f0edf4', type: 'dashed' } },
	},
	series: props.data.map(({ userId, values }) => {
		const mine = userId === userStore.userId
		const color = mine ? themeStore.lightThemeColor : '#e5adc9'
		return {
			name: userStore.getProfileById(userId)?.firstname || (mine ? 'You' : 'Partner'),
			type: 'line',
			data: parts.value.map(({ lastIndex }, index) => {
				if (index === parts.value.length - 1) {
					return userStore.getProfileById(userId)?.credit ?? values[lastIndex] ?? null
				}
				return values[lastIndex] ?? null
			}),
			connectNulls: false,
			showSymbol: true,
			symbol: 'circle',
			symbolSize: 6,
			lineStyle: { width: 3, color },
			areaStyle: { color, opacity: 0.12 },
			itemStyle: { color },
		}
	}),
}))
</script>

<style scoped>
.stats-chart { width: 100%; height: 260px; }
</style>
