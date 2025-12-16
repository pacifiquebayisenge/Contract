<template>
	<ClientOnly>
		<VChart :option="option" autoresize style="height: 280px" />
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ClientOnly } from '#components'

const props = defineProps<{
	data: [string, number][]
}>()

const option = computed(() => ({
	tooltip: { trigger: 'axis' },
	xAxis: { type: 'time' },
	yAxis: { type: 'value' },
	series: [
		{
			type: 'line',
			smooth: true,
			data: props.data,
		},
	],
}))
</script>
