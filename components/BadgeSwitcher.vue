<!-- components/ThemeSwitcher.vue -->
<template>
	<div class="badge-switcher justify-center py-5">
		<span class="font-color">badge ring</span>
		<div>
			<n-switch
				v-model:value="badgeRingActive"
				@update:value="handleBadgeRing"
				:rail-style="badgeRingSwitchStyle"
				size="large"
				:style="{
					'--n-text-color': '#484444c7',
				}"
			>
				<template #checked> inside </template>
				<template #unchecked> outside </template>
			</n-switch>
		</div>

		<span class="font-color">color</span>
		<div>
			<n-switch
				v-model:value="lightThemeActive"
				@update:value="handleLightTheme"
				:rail-style="lightThemeSwitchStyle"
				size="large"
				:style="{
					'--n-text-color': '#484444c7',
				}"
			>
				<template #checked> light </template>
				<template #unchecked> Extra light </template>
			</n-switch>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { CSSProperties } from 'vue'
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()

const lightThemeActive = ref(false)
const badgeRingActive = ref(false)

const handleBadgeRing = (value: boolean) => {
	const badgeRingOption = value ? themeStore.badgeRingOptions[0] : themeStore.badgeRingOptions[1]

	themeStore.setBadgeRingOption(badgeRingOption)
}

const handleLightTheme = (value: boolean) => {
	const themeOption = value ? themeStore.lightThemeOptions[0] : themeStore.lightThemeOptions[1]

	themeStore.setLightThemeOption(themeOption)
}

const lightThemeSwitchStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
	const style: CSSProperties = {}

	if (checked) {
		style.background = themeStore.getCurrentExtraLightThemeColor
		style.fontWeight = 700

		if (focused) {
			style.boxShadow = themeStore.getCurrentExtraLightThemeBoxShadow
		}
	} else {
		style.background = themeStore.getCurrentLightThemeColor
		style.fontWeight = 700

		if (focused) {
			style.boxShadow = themeStore.getCurrentLightThemeBoxShadow
		}
	}

	return style
}

const badgeRingSwitchStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
	const style: CSSProperties = {}

	if (checked) {
		style.background =
			themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
				? themeStore.getCurrentLightThemeColor
				: themeStore.getCurrentExtraLightThemeColor
		style.fontWeight = 700

		if (focused) {
			style.boxShadow =
				themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
					? themeStore.getCurrentLightThemeBoxShadow
					: themeStore.getCurrentExtraLightThemeBoxShadow
		}
	} else {
		style.background = adjustColor(
			themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
				? themeStore.getCurrentLightThemeColor
				: themeStore.getCurrentExtraLightThemeColor,
			-40
		)
		style.fontWeight = 700

		if (focused) {
			style.boxShadow = adjustColor(
				themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
					? themeStore.getCurrentLightThemeBoxShadow
					: themeStore.getCurrentExtraLightThemeBoxShadow,
				-40
			)
		}
	}

	return style
}

const adjustColor = (color: string, amount: number) => {
	const hex = color.replace('#', '')
	const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount))
	const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount))
	const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount))
	return `#${r.toString(16).padStart(2, '0')}${g
		.toString(16)
		.padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
</script>

<style scoped>
.badge-switcher {
	display: grid;
	grid-template-columns: auto auto;
	grid-template-rows: auto auto;
	gap: 16px;
}
</style>
