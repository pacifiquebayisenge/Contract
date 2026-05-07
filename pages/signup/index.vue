<template>
	<div class="flex justify-center items-center p-4">
		<n-card class="max-w-lg w-full card">
			<template #header>
				<div class="text-center font-semibold text-xxlg">Create Account</div>
			</template>

			<div class="field mb-8">
				<n-input
					v-model:value="email"
					class="bg-[#0000000a] rounded-[1rem] mb-4"
					type="email"
					placeholder="Email"
				>
					<template #prefix>
						<UserIcon class="w-5 h-5 text-gray-500" />
					</template>
				</n-input>
				<div class="line" />
			</div>

			<div class="field mb-8">
				<n-input
					v-model:value="password"
					:type="showPassword ? 'text' : 'password'"
					placeholder="Password"
					class="bg-[#0000000a] rounded-[1rem] mb-4"
				>
					<template #suffix>
						<component
							:is="showPassword ? EyeSlashIcon : EyeIcon"
							class="w-5 h-5 cursor-pointer text-gray-500"
							@click="showPassword = !showPassword"
						/>
					</template>
				</n-input>
				<div class="line" />
			</div>

			<button class="button-3D button-3D-colorfull" blockblock>
				<span v-if="loading">Loading...</span>
				<span v-else>... Call Admin ...</span>
			</button>

			<div class="flex flex-col items-center mt-4 space-y-8">
				<n-text class="mt-6 text-center">Already have an account ?</n-text>

				<n-button class="other-action" text @click="navigateTo('/signin')"> Login </n-button>
			</div>

			<n-alert class="mt-4" v-if="errorMessage" type="info">
				{{ errorMessage }}
			</n-alert>
		</n-card>
	</div>
</template>

<script setup lang="ts">
import { UserIcon } from '@heroicons/vue/24/outline'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/solid'
import { navigateTo } from '#app'
import { useThemeStore } from '~/stores/theme'

definePageMeta({
	layout: 'auth',
})

const { signup, loading, errorMessage } = useAuth()

const themeStore = useThemeStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const currentThemeColor = computed(() => themeStore.themeColor)

// eslint-disable-next-line no-unused-vars
async function handleSignup() {
	const success = await signup(email.value, password.value)

	if (success) {
		// You can choose what to do:
		// 1. Redirect to login:
		navigateTo('/signin')

		// OR
		// 2. Show a message on the same page:
		// message.value = "Account created! Check your email.";
	}
}
</script>

<style scoped lang="scss">
.card {
	background-color: none;
	background: none;
	border-style: none !important;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.field {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;

	.n-input {
		height: 5rem;

		display: flex;
		justify-content: center;
		align-items: center;

		&:hover,
		&:focus,
		&:focus-within {
			--n-border-hover: transparent !important;
			--n-border-focus: transparent !important;
			--n-box-shadow-focus: transparent !important;
			box-shadow: none !important;
			border: none !important;

			--n-caret-color: v-bind(currentThemeColor) !important;

			outline: none !important;
		}
	}

	input {
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

	// sibling magic ;o
	&:focus-within .line {
		&:after {
			transform: scaleX(1);
		}
	}

	.line {
		width: 100%;
		height: 3px;
		position: absolute;
		bottom: -8px;
		background: transparent;
		border-radius: 2rem;

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

.other-action {
	font-weight: 700;
	color: v-bind(currentThemeColor);

	&:active,
	&:hover,
	&:focus-visible {
		color: v-bind(currentLightThemeColor);
	}
}
</style>
