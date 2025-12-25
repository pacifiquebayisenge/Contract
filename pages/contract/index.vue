<template>
	<div class="contract-page-container animate-item">
		<div class="action-buttons py-3 px-16 mb-3 flex gap-8 animate-item">
			<button
				class="button-3D button-3D-colorfull animate-item font-color"
				@click="showNewDialog = !showNewDialog"
			>
				New
			</button>
		</div>

		<div class="filter-container my-2 px-8 py-4 invisible-scroll-component">
			<StatusBadge version="Badge" @click="handleStatusClick" name="Pending" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Progress" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Submitted" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Review" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Success" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Failed" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Expired" />
		</div>

		<div
			class="scroll-container invisible-scroll-component page-bottom-padding animate-item contract-item-container"
		>
			<n-infinite-scroll
				:distance="10"
				class="contract-item-container invisible-scroll"
				@load="handleLoad"
			>
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
const { animatePageEnter } = usePageAnimation()

let showNewDialog = ref(false)
let filterItemRef = ref('')

const profile = computed(() => userStore.profile)

const contractItems = computed(() => {
	if (filterItemRef.value)
		return contractStore.contractList.filter((item) => item.state === filterItemRef.value)
	return contractStore.getContractList
})

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

function handleStatusClick(state: string) {
	console.log('badge was clicked!', state)

	filterItemRef.value = state
}

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
