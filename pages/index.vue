<template>
	<div
		class="home-page-container scroll-container invisible-scroll page-bottom-padding animate-item"
	>
		<AvatarCard class="animate-item" :profile="userStore.profile" :pseudo="pseudoStore.myPseudo" />
		<AvatarCard
			class="animate-item"
			:profile="userStore.partnerProfile"
			:pseudo="pseudoStore.partnerPseudo"
		/>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'
import AvatarCard from '~/components/AvatarCard.vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { usePseudoStore } from '~/stores/pseudo'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const pseudoStore = usePseudoStore()

const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	animatePageEnter() // <-- THIS TRIGGERS THE ANIMATION
})
</script>

<style lang="scss" scoped>
.home-page-container {
	display: flex;
	flex-direction: column;
	gap: 3rem;

	& div:last-child {
		margin-bottom: 25rem;
	}

	div.n-card {
		border-radius: 2rem;

		// max-width: 400px;

		.header {
			display: flex;
			align-content: center;
			gap: 1rem;

			span {
				padding-top: 0.25rem;
				font-weight: 500;
			}
		}
	}
}
</style>
