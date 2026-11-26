<template>
	<div class="avatar-icon-container">
		<div
			class="avatar"
			:style="{ backgroundColor: currentLightThemeColor }"
			:class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
		>
			<div class="avatar-image" :class="optimizedWidth === '60' ? '' : 'pb-[2rem]'">
				<n-image
					:width="optimizedWidth"
					:src="getAvatarMood(props.fullname, props.mood)"
					:preview-disabled="true"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { pProps } from 'naive-ui'
import { useThemeStore } from '~/stores/theme'
import { getAvatarMood } from '~/utils/getAvatarImg'

const props = defineProps({
	mood: {
		type: String,
		default: '',
	},
	fullname: {
		type: String,
		default: '',
	},
})

const themeStore = useThemeStore()

const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const insideBadgeRing = computed(() => themeStore.isInsideBadgeRing)

const optimizedWidth = computed(() => {
	let width = '60'
	if (props.mood === 'idea') width = '90'
	return width
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
			z-index: 1;
		}
	}
}
</style>
