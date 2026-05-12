<template>
	<div class="card font-color m-[5px]">
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
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
h3 {
	margin-bottom: 12px;
	font-weight: 500;
}
</style>
