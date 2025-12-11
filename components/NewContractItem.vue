<template>
	<div class="new-contract-item-model">
		<span> Ah ! A new <span class="special">contract rule !!</span> </span>

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
			<span>Submit</span>
		</button>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
const contractStore = useContractStore()

const emit = defineEmits(['close'])

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)
const currentLightThemeColor = computed(() =>
	themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
		? themeStore.getCurrentLightThemeColor
		: themeStore.getCurrentExtraLightThemeColor
)

// local reactive copies
const title = ref('')
const description = ref('')

// 2️⃣ sync back to parent automatically
watch([title, description], ([newTitle, newDescription]) => {
	console.log({
		title: newTitle,
		description: newDescription,
	})
})

const submit = async () => {
	if (!title.value || !description.value) return

	await contractStore.addContractRule(title.value, description.value)

	emit('close')
}
</script>

<style lang="scss" scoped>
.new-contract-item-model {
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
