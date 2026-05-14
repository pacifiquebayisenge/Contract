<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="edit-contract-item-modal w-[80%]">
			<n-card
				class="modal-border gradient-background"
				:style="{
					'--theme-color': currentLightThemeColor,
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
						Edit contract
					</span>
				</template>
				<AvatarIcon mood="thinking" :fullname="props.fullname" />

				<span class="font-color text-center">
					Let's see what we can

					<span class="special" :style="{ '--theme-color': currentThemeColor }">change</span>

					about contract rule

					<span class="special" :style="{ '--theme-color': currentThemeColor }">{{
						index + 1
					}}</span>

					???
				</span>

				<div class="field" :style="{ '--line-fill-color': currentLightThemeColor }">
					<input
						v-model="title"
						type="text"
						placeholder="Contract rule..."
						class="bg-[#0000000a] rounded-[1rem] font-color contract-input"
					/>

					<div class="line">
						<div class="line-fill" />
					</div>
				</div>

				<div
					class="field w-[100%] max-w-[85rem]"
					:style="{ '--line-fill-color': currentLightThemeColor }"
				>
					<textarea
						v-model="description"
						placeholder="Description of the rule"
						class="h-[15rem] bg-[#0000000a] rounded-[1rem] w-[100%] max-w-[85rem] font-color contract-textarea"
					/>

					<div class="line">
						<div class="line-fill" />
					</div>
				</div>

				<button class="button-3D button-3D-colorful" @click="submit">
					<span class="font-color">Edit</span>
				</button>
			</n-card>
		</div>
	</n-modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
	show: { type: Boolean, required: true },

	index: {
		type: Number,
		default: 0,
	},

	item: {
		type: Object,
		default: () => ({
			title: '',
			description: '',
		}),
	},
	fullname: {
		type: String,
		default: '',
	},
})

const emit = defineEmits(['update:show'])

// local reactive copies
const title = ref('')
const description = ref('')

const themeStore = useThemeStore()
const contractStore = useContractStore()

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)

watch(
	() => props.show,
	(isOpen) => {
		if (isOpen) {
			title.value = props.item.title || ''
			description.value = props.item.description || ''
		}
	}
)

const submit = async () => {
	await contractStore.updateContractRule(props.item.id, {
		title: title.value.trim(),
		description: description.value.trim(),
	})

	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.edit-contract-item-modal {
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

	:deep(span) {
		font-size: 1.6rem;
		font-weight: 500;
	}

	:deep(.special) {
		color: var(--theme-color);
		font-weight: 700;
	}

	:deep(input),
	:deep(textarea) {
		padding: 0.5rem 1.5rem;
		border-radius: 1rem;
		border: none;
		outline: none;
		font-size: 1.5rem;
		font-weight: 600;
		color: #555555;
		transition: padding 0.3s 0.2s ease;
		resize: none;
	}

	:deep(.field) {
		position: relative;
		display: flex;
		justify-content: center;
		flex-direction: column; // missing
		align-items: center;
	}

	:deep(.line) {
		width: 100%;

		height: 3px;
		margin-top: 0.5rem;
		border-radius: 1rem;
		overflow: hidden;
	}

	:deep(.line-fill) {
		width: 100%;
		height: 100%;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.5s ease;
		background-color: var(--line-fill-color);
	}

	:deep(.field:focus-within .line-fill) {
		transform: scaleX(1);
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
