<template>
	<div class="contract-page-container">
		<div class="action-buttons py-8 px-16 mb-8 flex gap-8">
			<button class="button-3D button-3D-colorfull" @click="showNewDialog = !showNewDialog">
				New
			</button>
		</div>

		<div class="scroll-container invisible-scroll page-bottom-padding">
			<n-infinite-scroll :distance="10" @load="handleLoad">
				<ContractItem v-for="(item, index) in items" :key="index" :index="index" :item="item" />
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
							<n-image width="60" src="/memojis/jeje/idea.png" />
						</div>
					</div>
				</div>

				<NewContractItem />
			</n-card>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import ContractItem from '~/components/ContractItem.vue'
import { useThemeStore } from '~/stores/theme'

let showNewDialog = ref(false)

const themeStore = useThemeStore()

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

const items = [
	{
		id: '1',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '2',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '3',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '4',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '5',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '6',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '7',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '8',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '9',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '10',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '11',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '12',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '13',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '14',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
	{
		id: '15',
		title: 'contract rule title',
		description: 'Description of the contract rule',
	},
]
</script>

<style lang="scss" scoped>
.contract-page-container {
	display: flex;
	flex-direction: column;
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
