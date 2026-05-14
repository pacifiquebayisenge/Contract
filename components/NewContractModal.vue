<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="new-contract-item-modal w-[80%]">
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
						New contract
					</span>
				</template>

				<AvatarIcon mood="idea" :fullname="props.fullname" />

				<span class="font-color text-center" :style="{ '--theme-color': currentThemeColor }">
					Ah ! A new <span class="special">contract !!</span>
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
					<span class="font-color">Submit</span>
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
	show: {
		type: Boolean,
		required: true,
	},
	fullname: {
		type: String,
		default: '',
	},
})

const themeStore = useThemeStore()
const contractStore = useContractStore()

const emit = defineEmits(['update:show'])

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)

const title = ref('')
const description = ref('')

watch(
	() => props.show,
	(isOpen) => {
		if (isOpen) {
			title.value = ''
			description.value = ''
		}
	}
)

const submit = async () => {
	if (!title.value || !description.value) return

	await contractStore.addContractRule(title.value.trim(), description.value.trim())

	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.new-contract-item-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3rem;
	border-radius: 2rem;
}

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

:deep(.font-color) {
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
	align-items: center;
	flex-direction: column;
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
