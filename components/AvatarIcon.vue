<template>
	<div class="avatar-icon-container">
		<div
			class="avatar"
			:style="{ backgroundColor: currentLightThemeColor }"
			:class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
		>
			<div class="avatar-image">
				<n-image width="70" :src="getAvatarMood(fullName, 'idea')" :preview-disabled="true" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { getAvatarMood } from '~/utils/getAvatarImg'

const userStore = useUserStore()
const themeStore = useThemeStore()

const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const insideBadgeRing = computed(() => themeStore.isInsideBadgeRing)

const profile = computed(() => userStore.profile)

const fullName = computed(() => {
	if (!profile.value || !profile.value.firstname || !profile.value.lastname) return 'Full name ?'
	return profile.value.firstname + ' ' + profile.value.lastname
})
</script>

<style lang="scss" scoped>
.avatar-icon-container {
	display: flex;
	justify-content: center;
	gap: 3rem;

	.avatar {
		width: 8rem;
		height: 8rem;
		background-color: v-bind(currentLightThemeColor);
		border-radius: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;

		&.outside-ring,
		&.inside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
		}

		&.outside-ring {
			outline-offset: 3px;
		}

		&.inside-ring {
			outline-offset: -5px;
		}

		:deep(.n-image img) {
			margin-bottom: 2rem;
			z-index: 1;
		}
	}
}
</style>
