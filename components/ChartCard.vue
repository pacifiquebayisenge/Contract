<template>
	<div class="card">
		<h3>{{ title }}</h3>
		<slot />
	</div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.card {
	background: white;
	padding: 16px;
	border-radius: 16px;
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
h3 {
	margin-bottom: 12px;
}
</style>
