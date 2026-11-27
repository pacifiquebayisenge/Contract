<template>
	<ClientOnly>
		<VChart :option="option" autoresize class="stats-chart" />
	</ClientOnly>
</template>

<script setup lang="ts">
import type { StatsSeries } from '~/composables/useStats'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

const props = defineProps<{ days: string[]; data: StatsSeries[] }>()
const themeStore = useThemeStore()
const userStore = useUserStore()
const dates = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const formatDay = (day: string) => dates.format(new Date(day))

const option = computed(() => ({
	animation: false,
	grid: { left: 36, right: 12, top: 22, bottom: 64 },
	legend: { bottom: 4, type: 'scroll' },
	tooltip: { trigger: 'axis', renderMode: 'richText', confine: true, axisPointer: { type: 'shadow' } },
	xAxis: {
		type: 'category',
		data: props.days,
		axisLabel: { formatter: formatDay, hideOverlap: true, margin: 10 },
		axisTick: { show: false },
	},
	yAxis: {
		type: 'value',
		min: 0,
		max: ({ max }: { max: number }) => Math.max(5, max + 1),
		minInterval: 1,
		splitLine: { lineStyle: { color: '#e5e7eb' } },
	},
	series: props.data.map(({ userId, values }, index) => {
		const mine = userId === userStore.userId
		return {
			name: userStore.getProfileById(userId)?.firstname || (mine ? 'You' : 'Partner'),
			type: 'bar',
			data: values,
			barMaxWidth: 12,
			itemStyle: { color: mine ? themeStore.themeColor : '#c27645', borderRadius: [2, 2, 0, 0] },
			...(index === 0 && {
				markLine: {
					silent: true,
					symbol: 'none',
					label: { formatter: 'Free limit', position: 'insideEndTop' },
					lineStyle: { color: '#9f6671', type: 'dashed' },
					data: [{ yAxis: 3 }],
				},
			}),
		}
	}),
}))
</script>

<style scoped>
.stats-chart { width: 100%; height: 245px; }
</style>
