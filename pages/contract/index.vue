<template>
	<div class="contract-page-container animate-item">
		<div class="action-buttons py-3 px-16 mb-3 flex gap-8 animate-item">
			<button
				class="button-3D button-3D-colorfull animate-item"
				@click="showNewDialog = !showNewDialog"
			>
				New
			</button>
		</div>

		<div class="filter-container my-6 px-8 py-4 invisible-scroll-component">
			<StatusBadge name="pending" @click="test" />
			<StatusBadge name="in-progress" />
			<StatusBadge name="submitted" />
			<StatusBadge name="in-review" />
			<StatusBadge name="success" />
			<StatusBadge name="failed" />
			<StatusBadge name="expired" />
		</div>

		<div
			class="scroll-container invisible-scroll page-bottom-padding animate-item contract-item-container"
		>
			<n-infinite-scroll :distance="10" class="contract-item-container" @load="handleLoad">
				<ContractItem
					v-for="(item, index) in contractItems"
					:key="item.id"
					:index="index"
					:item="item"
					class="animate-item"
				/>

				<div v-if="!contractItems.length" class="empty-list">no items...</div>
			</n-infinite-scroll>
		</div>

		<n-modal v-model:show="showNewDialog" :auto-focus="false" transform-origin="center">
			<n-card
				style="max-width: 80%"
				:style="{ borderRadius: '1rem !important' }"
				:bordered="false"
				size="huge"
				role="dialog"
			>
				<!-- // TODO change this to userbased icon -->
				<div class="avatar-container py-8">
					<div
						class="avatar"
						:style="{ backgroundColor: currentLightThemeColor }"
						:class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
					>
						<div class="avatar-image">
							<n-image width="60" :src="getAvatarMood(fullName, 'idea')" />
						</div>
					</div>
				</div>

				<NewContractItem @close="showNewDialog = false" />
			</n-card>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import ContractItem from '~/components/ContractItem.vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { getAvatarMood } from '~/utils/getAvatarImg'

const themeStore = useThemeStore()
const userStore = useUserStore()
const contractStore = useContractStore()

let showNewDialog = ref(false)

const profile = computed(() => userStore.profile)
const contractItems = computed(() => contractStore.getContractList)

const fullName = computed(() => {
	if (!profile.value || !profile.value.firstname || !profile.value.lastname) return 'Full name ?'
	return profile.value.firstname + ' ' + profile.value.lastname
})

// Computed property for dynamic theme color
const currentLightThemeColor = computed(() =>
	themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
		? themeStore.getCurrentLightThemeColor
		: themeStore.getCurrentExtraLightThemeColor
)

const insideBadgeRing = computed(
	() => themeStore.currentBadgeRingOption === themeStore.badgeRingOptions[0]
)

// const count = ref(15);

function handleLoad() {
	// count.value += 1;
}
const test = () => {
	console.log('click')
}

const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	animatePageEnter() // <-- THIS TRIGGERS THE ANIMATION
})
</script>

<style lang="scss" scoped>
.contract-page-container {
	display: flex;
	flex-direction: column;

	.filter-container {
		display: flex;
		gap: 1rem;
		overflow-x: scroll;
	}

	.scroll-container div div:last-child {
		margin-bottom: 35rem;
	}

	.empty-list {
		padding: 4rem;
		text-align: center;
	}
}

.avatar-container {
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

		&.outside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
			outline-offset: 3px;
		}
		&.inside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
			outline-offset: -5px;
		}
	}
}
</style>
