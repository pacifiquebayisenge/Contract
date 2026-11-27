<template>
	<div class="card app-surface-card font-color m-[5px]">
		<h3>{{ props.title }}</h3>
		<slot />
	</div>
</template>

<script setup lang="ts">
const props = defineProps({
	title: {
		type: String,
		default: '',
	},
})
</script>

<style scoped>
.card {
	background: white;
	padding: 16px;
	border-radius: 16px;
}
h3 {
	margin-bottom: 12px;
	font-weight: 500;
}
</style>
