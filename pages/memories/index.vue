<template>
	<div class="animate-item">Memories</div>
</template>

<script setup>
import { usePageAnimation } from '~/composables/usePageAnimation'

const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	animatePageEnter() // <-- THIS TRIGGERS THE ANIMATION
})
</script>
