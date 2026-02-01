<template>
	<div class="card">
		<div class="title font-color">{{ title }}</div>
		<div class="value font-color">
			<Vue3Countup :number="value" :more-options="countupOptions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Vue3Countup } from 'vue3-countup'

const props = defineProps<{
	title: string
	value: number
	currency?: boolean
}>()

const isCurrency = computed(() => (props.currency ? '€ ' : ''))

const countupOptions = {
	useEasing: true,
	useGrouping: true,
	duration: '2.5',
	separator: ' ',
	decimal: '.',
	prefix: isCurrency.value,
	suffix: '',
}
</script>

<style scoped>
.card {
	padding: 16px;
	border-radius: 12px;
	background: white;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.title {
	font-size: 12px;
	font-weight: 500;
	opacity: 0.6;
	display: flex;
	justify-content: center;
}
.value {
	font-size: 24px;
	font-weight: 600;
	display: flex;
	justify-content: center;
}
</style>
