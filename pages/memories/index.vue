<template>
	<div v-if="false" class="content animate-item">
		<div class="animate-item">Memories</div>
		<div class="avatar-container py-8 animate-item">
			<!-- Left mirrored avatar -->
			<div class="avatar-image mirror animate-item">
				<n-image
					style="transform: rotate(5deg) scaleX(-1)"
					width="80"
					src="/memojis/jeje/thinking.png"
					class="animate-item"
				/>
			</div>

			<!-- Right avatar -->
			<div class="avatar-image animate-item">
				<n-image
					style="transform: rotate(3deg)"
					width="81"
					src="/memojis/paci/thinking.png"
					class="animate-item"
				/>
			</div>

			<!-- Shadows (anchored to floor) -->
			<div class="avatar-shadow left animate-item"></div>
			<div class="avatar-shadow right animate-item"></div>
		</div>

		<p class="title">Please wait ...</p>
		<p class="comm">Not enough <strong class="special"> data </strong> yet</p>
	</div>
</template>

<script setup>
import { usePageAnimation } from '~/composables/usePageAnimation'

const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	animatePageEnter() // <-- THIS TRIGGERS THE ANIMATION
})
</script>
