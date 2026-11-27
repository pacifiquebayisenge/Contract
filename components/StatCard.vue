<template>
	<div class="card app-surface-card animate-item">
		<div class="title font-color">{{ title }}</div>
		<div class="value font-color">
			<Vue3Countup v-if="value !== null" :number="value" :more-options="countupOptions" />
			<span v-else>—</span>
			<span v-if="value !== null && total !== undefined" class="value-total">/ {{ total }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Vue3Countup } from 'vue3-countup'

defineProps<{
	title: string
	value: number | null
	total?: number
}>()

const countupOptions = {
	useEasing: true,
	useGrouping: true,
	duration: 2,
	separator: ' ',
	decimal: '.',
}
</script>

<style scoped>
.card {
	padding: 16px;
	border-radius: 12px;
	background: white;
}
.title {
	font-size: 12px;
	font-weight: 600;
	color: #64748b;
	text-align: center;
	display: flex;
	justify-content: center;
}
.value {
	font-size: 24px;
	font-weight: 600;
	display: flex;
	justify-content: center;
}
.value-total {
	align-self: baseline;
	margin-inline-start: 0.3rem;
	font-size: 0.65em;
	color: #64748b;
}
</style>
