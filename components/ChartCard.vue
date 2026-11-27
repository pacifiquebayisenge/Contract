<template>
	<div class="card app-surface-card font-color">
		<h2>{{ title }}</h2>
		<p v-if="subtitle">{{ subtitle }}</p>
		<slot />
	</div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<style scoped>
.card {
	background: white;
	padding: 16px;
	border-radius: 16px;
	min-width: 0;
}
h2 { font-size: 1.35rem; font-weight: 700; }
p { margin: 0.2rem 0 0.75rem; font-size: 1.1rem; color: #64748b; }
</style>
