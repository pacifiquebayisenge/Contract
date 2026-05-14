<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="delete-contract-item-modal w-[80%]">
			<n-card
				class="modal-border gradient-background"
				:style="{
					'--theme-color': lightThemeColor,
				}"
				:bordered="false"
				size="huge"
				role="dialog"
			>
				<template #header>
					<span
						style="font-weight: bold; display: flex; justify-content: center"
						class="font-color"
					>
						Delete contract
					</span>
				</template>
				<AvatarIcon mood="shook" :fullname="props.fullname" />

				<span class="font-color text-center">
					Are you

					<span class="special" :style="{ '--theme-color': currentThemeColor }"> sure </span>

					you want to delete contract rule

					<span class="special" :style="{ '--theme-color': currentThemeColor }">{{
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
	fullname: {
		type: String,
		default: '',
	},
})

const emit = defineEmits(['update:show'])

const themeStore = useThemeStore()
const contractStore = useContractStore()

const currentThemeColor = computed(() => themeStore.themeColor)
const lightThemeColor = computed(() => themeStore.lightThemeColor)

const submit = async () => {
	await contractStore.deleteContractRule(props.item.id)
	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.delete-contract-item-modal {
	border-radius: 2rem;
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

.gradient-background {
	background: linear-gradient(
		to bottom,
		#f9f9fb 0%,
		#f9f9fb 5%,
		color-mix(in srgb, var(--theme-color) 15%, #f9f9fb) 60%,
		color-mix(in srgb, var(--theme-color) 30%, #f9f9fb) 100%
	);

	background-attachment: fixed;
}

.gradient::before {
	content: '';
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 0;

	background: linear-gradient(
		135deg,
		transparent 0%,
		transparent 50%,
		color-mix(in srgb, var(--theme-color) 3%, transparent) 100%
	);

	opacity: 0.25;
}
</style>
