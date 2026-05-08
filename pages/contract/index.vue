<template>
	<div class="contract-page-container animate-item">
		<div class="action-buttons py-3 px-16 mb-3 flex gap-8 animate-item">
			<button
				class="button-3D button-3D-colorful animate-item font-color"
				@click="showNewDialog = !showNewDialog"
			>
				New
			</button>
		</div>

		<!-- <div class="filter-container my-2 px-8 py-4 invisible-scroll-component">
			<StatusBadge version="Badge" @click="handleStatusClick" name="Pending" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Progress" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Submitted" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Review" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Success" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Failed" />
			<StatusBadge version="Badge" @click="handleStatusClick" name="Expired" />
		</div> -->

		<div
			class="scroll-container invisible-scroll-component page-bottom-padding animate-item contract-item-container"
		>
			<n-infinite-scroll :distance="10" class="contract-item-container invisible-scroll">
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

		<NewContractModal v-model:show="showNewDialog" />
	</div>
</template>

<script setup lang="ts">
import ContractItem from '~/components/ContractItem.vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useContractStore } from '~/stores/contract'

const contractStore = useContractStore()
const { animatePageEnter } = usePageAnimation()

let showNewDialog = ref(false)
let filterItemRef = ref('')

const contractItems = computed(() => {
	if (filterItemRef.value)
		return contractStore.contractList.filter((item) => item.state === filterItemRef.value)
	return contractStore.getContractList
})

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
</style>
