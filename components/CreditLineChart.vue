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

const option = computed(() => ({
	animation: false,
	grid: { left: 48, right: 12, top: 18, bottom: 64 },
	legend: { bottom: 4, type: 'scroll' },
	tooltip: {
		trigger: 'axis',
		renderMode: 'richText',
		confine: true,
		valueFormatter: (value: unknown) =>
			typeof value === 'number' ? amounts.format(value).replace(/,/g, ' ') : '—',
	},
	xAxis: {
		type: 'category',
		data: props.days,
		axisLabel: { formatter: formatDay, hideOverlap: true, margin: 10 },
		axisTick: { show: false },
	},
	yAxis: {
		type: 'value',
		scale: true,
		axisLabel: { formatter: (value: number) => formatCountToMs(value) },
		splitLine: { lineStyle: { color: '#e5e7eb' } },
	},
	series: props.data.map(({ userId, values }) => {
		const mine = userId === userStore.userId
		const color = mine ? themeStore.themeColor : '#c27645'
		return {
			name: userStore.getProfileById(userId)?.firstname || (mine ? 'You' : 'Partner'),
			type: 'line',
			data: values,
			step: 'end',
			connectNulls: false,
			showSymbol: false,
			lineStyle: { width: 2, color },
			itemStyle: { color },
		}
	}),
}))
</script>

<style scoped>
.stats-chart { width: 100%; height: 260px; }
</style>
