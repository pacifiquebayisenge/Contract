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

const props = defineProps<{ days: string[]; data: StatsSeries[] }>()
const themeStore = useThemeStore()
const userStore = useUserStore()

const parts = computed(() => getMonthParts(props.days))

const option = computed(() => ({
	animation: false,
	grid: { left: 36, right: 12, top: 22, bottom: 64 },
	legend: {
		bottom: 5,
		type: 'scroll',
		icon: 'roundRect',
		itemWidth: 12,
		itemHeight: 7,
		textStyle: { color: '#667085' },
	},
	tooltip: { trigger: 'axis', renderMode: 'richText', confine: true },
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
		min: 0,
		max: ({ max }: { max: number }) => Math.max(5, max + 1),
		minInterval: 1,
		axisLabel: { color: '#667085' },
		splitNumber: 3,
		splitLine: { lineStyle: { color: '#f0edf4', type: 'dashed' } },
	},
	series: props.data.map(({ userId, values }, index) => {
		const mine = userId === userStore.userId
		const color = mine ? themeStore.themeColor : '#f5a96e'
		return {
			name: userStore.getProfileById(userId)?.firstname || (mine ? 'You' : 'Partner'),
			type: 'line',
			data: parts.value.map(({ firstIndex, lastIndex }, index) => {
				if (index === parts.value.length - 1) return values[lastIndex] ?? 0
				// Closed segments show the most recent day with recorded use.
				return values.slice(firstIndex, lastIndex + 1).findLast((value) => value != null && value > 0) ?? 0
			}),
			symbol: 'circle',
			symbolSize: 5,
			showAllSymbol: true,
			lineStyle: { color, width: 2.5 },
			itemStyle: { color },
			...(index === 0 && {
				markLine: {
					silent: true,
					symbol: 'none',
					label: { formatter: 'Daily free limit', position: 'insideEndTop', color: '#8c687b', fontSize: 10 },
					lineStyle: { color: '#d9a9bd', type: 'dashed' },
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
