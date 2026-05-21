<template>
	<NModalProvider>
		<div id="app-container" class="flex flex-col h-screen overflow-hidden">
			<!-- bg-[#f9f9fb] -->
			<div class="ios-status-bar-bg"></div>

			<div class="top-bar-background">
				<div
					class="sticky top-0 z-50 flex justify-center items-center py-2 rounded-t-3xl flex-shrink-0 bg-[#f9f9fb]"
					style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
				>
					<TopNavBar />
				</div>
			</div>

			<!-- Scrollable page content only -->
			<!-- bg-[#f9f9fb] -->
			<main class="flex-1 overflow-hidden">
				<div class="h-full px-6 pt-[2rem] overflow-hidden pb-10">
					<slot />
				</div>

				<div
					class="fixed bottom-[6rem] left-0 right-0 z-50 flex justify-center items-center pointer-events-none !bg-transparent"
				>
					<div class="pointer-events-auto">
						<BottomMenuBar />
					</div>
				</div>
			</main>

			<PWAUpdateDialog />
			<PWAInstallPrompt />
		</div>
	</NModalProvider>
</template>

<script setup>
import { NModalProvider } from 'naive-ui'
import BottomMenuBar from '~/components/BottomMenuBar.vue'
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'
import PWAUpdateDialog from '~/components/PWAUpdateDialog.vue'
import TopNavBar from '~/components/TopNavBar.vue'
import { useThemeStore } from '~/stores/theme'

const nuxtApp = useNuxtApp()
const themeStore = useThemeStore()
const authLoading = nuxtApp.$authLoading

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)
const currentExtraLightThemeColor = computed(() => themeStore.extraLightThemeColor)

useHead({
	meta: [
		{
			name: 'viewport',
			content:
				'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
		},
		{
			name: 'theme-color',
			content: currentThemeColor.value,
		},
		{
			name: 'apple-mobile-web-app-status-bar-style',
			content: 'black-translucent',
		},
	],
})
</script>

<style lang="scss">
div#app-container {
	touch-action: none;
	overflow: hidden;
	min-height: 100vh;

	background: linear-gradient(
		to bottom,
		#f9f9fb 0%,
		#f9f9fb 25%,
		color-mix(in srgb, v-bind(currentLightThemeColor) 15%, #f9f9fb) 60%,
		color-mix(in srgb, v-bind(currentLightThemeColor) 30%, #f9f9fb) 100%
	);

	background-attachment: fixed;

	padding-top: env(safe-area-inset-top);
	// padding-bottom: env(safe-area-inset-bottom);
}

main > div:first-child {
	padding-bottom: calc(5rem + max(1rem, env(safe-area-inset-bottom)));
}

&::before {
	content: '';
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 0;

	background: linear-gradient(
		135deg,
		transparent 0%,
		transparent 50%,
		color-mix(in srgb, v-bind(currentLightThemeColor) 3%, transparent) 100%
	);

	opacity: 0.08;
}

& > * {
	position: relative;
	z-index: 1;
}

// iOS 26 PWA/Safari workaround:
//  Status bar color follows a fixed top element
//  more reliably than theme-color
// 	Installed PWA  → fix works ✅
// Safari browser → cannot fully control it ❌
.ios-status-bar-bg {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;

	height: env(safe-area-inset-top);
	background-color: v-bind(currentThemeColor);

	z-index: 9999;
	pointer-events: none;
}

.top-bar-background {
	background-color: v-bind(currentThemeColor);
}

& > div > div {
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

// .app-background {
// 	position: relative;
// 	min-height: 100vh;
// 	overflow: hidden;

// 	background: linear-gradient(
// 		to bottom,
// 		#f9f9fb 0%,
// 		#f9f9fb 25%,
// 		color-mix(in srgb, v-bind(currentLightThemeColor) 15%, #f9f9fb) 60%,
// 		color-mix(in srgb, v-bind(currentLightThemeColor) 30%, #f9f9fb) 100%
// 	);

// 	background-attachment: fixed;
// }

// .app-background::before {
// 	content: '';
// 	position: fixed;
// 	inset: 0;
// 	pointer-events: none;
// 	z-index: 0;

// 	background: linear-gradient(
// 		135deg,
// 		transparent 0%,
// 		transparent 50%,
// 		color-mix(in srgb, v-bind(currentLightThemeColor) 3%, transparent) 100%
// 	);

// 	opacity: 0.08;
// }

// .app-background > * {
// 	position: relative;
// 	z-index: 1;
// }
</style>
