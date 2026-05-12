<template>
	<NModalProvider>
		<n-spin :show="authLoading.visible.value" size="large">
			<div id="app-container" class="flex flex-col h-screen app-background">
				<!-- bg-[#f9f9fb] -->
				<div
					class="sticky top-0 z-50 flex justify-center items-center py-2 rounded-t-3xl flex-shrink-0 bg-transparent"
					style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
				>
					<TopNavBar />
				</div>

				<!-- Scrollable page content only -->
				<!-- bg-[#f9f9fb] -->
				<main class="flex-1 overflow-hidden">
					<div class="h-full px-6 pt-[2rem] pb-10">
						<slot />
					</div>
				</main>

				<PWAUpdateDialog />
				<PWAInstallPrompt />

				<div
					class="fixed bottom-[40px] left-0 right-0 z-50 flex justify-center items-center pointer-events-none !bg-transparent"
				>
					<div class="pointer-events-auto">
						<BottomMenuBar />
					</div>
				</div>
			</div>
		</n-spin>
	</NModalProvider>
</template>

<script setup>
import { NModalProvider } from 'naive-ui'
import BottomMenuBar from '~/components/BottomMenuBar.vue'
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'
import PWAUpdateDialog from '~/components/PWAUpdateDialog.vue'
import TopNavBar from '~/components/TopNavBar.vue'
import { useThemeStore } from '~/stores/theme'

useHead({
	meta: [
		{
			name: 'viewport',
			content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
		},
	],
})

const nuxtApp = useNuxtApp()
const themeStore = useThemeStore()
const authLoading = nuxtApp.$authLoading

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)
const currentExtraLightThemeColor = computed(() => themeStore.extraLightThemeColor)
</script>

<style lang="scss">
div#app-container {
	touch-action: none;
	overflow: hidden;
	height: 100vh;

	& > div {
		background-color: #f9f9fb;
		background-clip: padding-box;
	}

	/* Ensure modal backdrops don't create scroll */
	.n-modal-container {
		position: fixed;
		overflow: hidden;
	}

	/* Prevent body scroll when modal is open */
	body.modal-open {
		overflow: hidden;
	}
}

/* Main content scroll area */
main {
	scrollbar-width: thin;
	scrollbar-color: #c1c1c1 transparent;
}

main::-webkit-scrollbar {
	width: 6px;
}

main::-webkit-scrollbar-track {
	background: transparent;
}

main::-webkit-scrollbar-thumb {
	background-color: #c1c1c1;
	border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
	background-color: #a8a8a8;
}

.app-background {
	position: relative;
	min-height: 100vh;
	overflow: hidden;

	background: linear-gradient(
		to bottom,
		#f9f9fb 0%,
		color-mix(in srgb, v-bind(currentExtraLightThemeColor) 25%, #f9f9fb) 100%
	);

	background-attachment: fixed;
}

.app-background::before {
	content: '';
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 0;

	background: linear-gradient(
		135deg,
		transparent 0%,
		color-mix(in srgb, v-bind(currentThemeColor) 4%, transparent) 55%,
		transparent 50%
	);

	opacity: 0.25;
}

.app-background > * {
	position: relative;
	z-index: 1;
}
</style>
