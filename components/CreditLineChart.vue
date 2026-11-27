<template>
	<ClientOnly>
		<VChart :option="option" autoresize class="stats-chart" />
	</ClientOnly>
</template>

<script setup lang="ts">
import type { StatsSeries } from '~/composables/useStats'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { formatCountToMs } from '~/utils/numbers'

const props = defineProps<{ days: string[]; data: StatsSeries[] }>()
const themeStore = useThemeStore()
const userStore = useUserStore()
const amounts = new Intl.NumberFormat('en-US')
const dates = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const formatDay = (day: string) => dates.format(new Date(day))

function weekStart(day: string) {
	const date = new Date(day)
	date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
	return date.toISOString().slice(0, 10)
}

function weeklyPeaks(values: StatsSeries['values'], weekKeys: string[], weekStarts: string[]) {
	const peaks = new Map<string, number>()
	weekKeys.forEach((week, index) => {
		const balance = values[index]
		if (balance != null) peaks.set(week, Math.max(balance, peaks.get(week) ?? balance))
	})
	return weekStarts.map((week) => peaks.get(week) ?? null)
}

const weekByDay = computed(() => {
	const firstDay = props.days[0]
	return props.days.map((day) => {
		const monday = weekStart(day)
		// The first week can start before the visible two-month period.
		return monday < firstDay ? firstDay : monday
	})
})
const weeks = computed(() => [...new Set(weekByDay.value)])

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
		data: weeks.value,
		axisLabel: {
			formatter: formatDay,
			interval: Math.max(0, Math.ceil(weeks.value.length / 5) - 1),
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
			data: weeklyPeaks(values, weekByDay.value, weeks.value),
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
