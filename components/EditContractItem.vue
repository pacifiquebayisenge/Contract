<template>
	<div class="edit-contract-item-modal">
		<span>
			Let's see what we can <span class="special">change</span> about contract rule
			<span class="special">{{ index + 1 }}</span> ???
		</span>

		<div class="field">
			<input
				v-model="title"
				type="text"
				placeholder="Contract rule..."
				class="bg-[#0000000a] rounded-[1rem]"
			/>
			<div class="line" />
		</div>

		<div class="field w-[100%] max-w-[85rem]">
			<textarea
				v-model="description"
				placeholder="Description of the rule"
				class="h-[15rem] bg-[#0000000a] rounded-[1rem] w-[100%] max-w-[85rem]"
			/>
			<div class="line" />
		</div>

		<button class="button-3D button-3D-colorfull" @click="submit">
			<span>Edit</span>
		</button>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'

const props = defineProps({
	modelValue: {
		type: Object,
		default: () => ({}),
	},
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
})

const emit = defineEmits(['close'])

const { item } = props

// local reactive copies
const title = ref('')
const description = ref('')

const themeStore = useThemeStore()
const contractStore = useContractStore()

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)
const currentLightThemeColor = computed(() =>
	themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
		? themeStore.getCurrentLightThemeColor
		: themeStore.getCurrentExtraLightThemeColor
)

// 1️⃣ populate on launch
onMounted(() => {
	title.value = item.title || ''
	description.value = item.description || ''
	console.log(title.value, description.value)
})

const submit = async () => {
	await contractStore.updateContractRule(item.id, {
		title: title.value,
		description: description.value,
	})

	emit('close')
}
</script>

<style lang="scss" scoped>
.edit-contract-item-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3rem;

	& > span {
		text-align: center;
	}

	span {
		font-size: 1.6rem;
		font-weight: 500;

		.special {
			color: v-bind(currentThemeColor);
			font-weight: 700;
		}
	}

	input,
	textarea {
		padding: 0.5rem 1.5rem;
		border-radius: 1rem;
		border: none;
		outline: none;
		font-size: 1.5rem;
		font-weight: 600;
		color: #555555;
		transition: padding 0.3s 0.2s ease;
		resize: none;
		// sibling magic ;o
		&:focus + .line {
			&:after {
				transform: scaleX(1);
			}
		}
	}

	.field {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		.line {
			width: 100%;
			height: 3px;
			position: absolute;
			bottom: -8px;
			background: white;

			&:after {
				content: ' ';
				position: absolute;
				float: right;
				width: 100%;
				height: 3px;

				transform: scalex(0);
				transition: transform 0.3s ease;

				background: v-bind(currentLightThemeColor);
			}
		}
	}
}
</style>
