<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="delete-contract-item-modal w-[80%]">
			<n-card class="modal-border" :bordered="false" size="huge" role="dialog">
				<template #header>
					<span
						style="font-weight: bold; display: flex; justify-content: center"
						class="font-color"
					>
						Delete contract
					</span>
				</template>
				<AvatarIcon mood="shook" />

				<span class="font-color text-center">
					Are you

					<span class="special" :style="{ '--theme-color': themeStore.themeColor }"> sure </span>

					you want to delete contract rule

					<span class="special" :style="{ '--theme-color': themeStore.themeColor }">{{
						index + 1
					}}</span>

					???
				</span>

				<span class="font-color">{{ item.title }}</span>

				<button class="button-3D button-3D-colorful-error" @click="submit">Delete</button>
			</n-card>
		</div>
	</n-modal>
</template>

<script setup lang="ts">
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
	show: { type: Boolean, required: true },
	index: { type: Number, default: 0 },
	item: {
		type: Object,
		default: () => ({ id: undefined, title: undefined, description: undefined }),
	},
})

const emit = defineEmits(['update:show'])

const themeStore = useThemeStore()
const contractStore = useContractStore()

const submit = async () => {
	await contractStore.deleteContractRule(props.item.id)
	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.delete-contract-item-modal {
	:deep(.n-card-content) {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		align-items: center;
		align-content: center;
		justify-content: center;
	}

	:deep(.modal-border) {
		border-radius: 2rem !important;
	}

	span {
		font-size: 1.6rem;
		font-weight: 500;

		.special {
			color: var(--theme-color);
			font-weight: 700;
		}
	}
}
</style>
