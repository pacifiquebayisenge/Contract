<template>
	<div class="card">
		<div class="title">{{ title }}</div>
		<div class="value">{{ value }}</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	title: string
	value: string | number
}>()
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
	opacity: 0.6;
}
.value {
	font-size: 24px;
	font-weight: 600;
}
</style>
