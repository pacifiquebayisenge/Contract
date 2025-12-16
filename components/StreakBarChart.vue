<template>
	<ClientOnly>
		<VChart :option="option" autoresize style="height: 280px; width: 100%" />
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClientOnly } from '#components'

type Item = { day: string; count: number }

const props = defineProps<{ data: Item[] }>()

const option = computed(() => ({
	tooltip: { trigger: 'axis' },
	xAxis: {
		type: 'category',
		data: props.data.map((d) => d.day),
	},
	yAxis: { type: 'value', max: 6 },
	series: [
		{
			type: 'bar',
			data: props.data.map((d) => d.count),
			barWidth: '50%',
			itemStyle: { borderRadius: [6, 6, 0, 0] },
		},
		{
			type: 'line',
			data: Array(props.data.length).fill(3),
			symbol: 'none',
			lineStyle: { type: 'dashed' },
		},
	],
}))
</script>
