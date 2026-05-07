<!-- components/ThemeSwitcher.vue -->
<template>
	<div class="badge-switcher justify-center py-5">
		<span class="font-color">badge ring</span>
		<n-switch
			v-model:value="badgeRingActive"
			@update:value="handleBadgeRing"
			:rail-style="badgeRingSwitchStyle"
			size="large"
			:style="{ '--n-text-color': '#484444c7' }"
		>
			<template #checked>inside</template>
			<template #unchecked>outside</template>
		</n-switch>

		<span class="font-color">color</span>
		<n-switch
			v-model:value="lightThemeActive"
			@update:value="handleLightTheme"
			:rail-style="lightThemeSwitchStyle"
			size="large"
			:style="{ '--n-text-color': '#484444c7' }"
		>
			<template #checked>light</template>
			<template #unchecked>extra light</template>
		</n-switch>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { useThemeStore } from '~/stores/theme'
import { adjustColor } from '~/utils/color'

type SwitchStyleArgs = { focused: boolean; checked: boolean }

const themeStore = useThemeStore()

// Boolean
const badgeRingActive = ref(themeStore.isInsideBadgeRing)
const lightThemeActive = ref(themeStore.currentLightThemeOption === 'light-color')

// The color to use depends on which light theme option is active
const selectedLightColor = computed(() => themeStore.selectedLightThemeColor)
const selectedLightBoxShadow = computed(() => themeStore.selectedLightThemeBoxShadow)

const handleBadgeRing = (value: boolean) => {
	themeStore.setBadgeRingOption(value ? 'inside' : 'outside')
}

const handleLightTheme = (value: boolean) => {
	themeStore.setLightThemeOption(value ? 'light-color' : 'extra-light-color')
}

const lightThemeSwitchStyle = ({ focused, checked }: SwitchStyleArgs): CSSProperties => ({
	background: checked ? themeStore.extraLightThemeColor : themeStore.lightThemeColor,
	fontWeight: 700,
	...(focused && {
		boxShadow: checked ? themeStore.extraLightThemeBoxShadow : themeStore.lightThemeBoxShadow,
	}),
})

const badgeRingSwitchStyle = ({ focused, checked }: SwitchStyleArgs): CSSProperties => ({
	background: checked ? selectedLightColor.value : adjustColor(selectedLightColor.value, -40),
	fontWeight: 700,
	...(focused && {
		boxShadow: checked
			? selectedLightBoxShadow.value
			: adjustColor(selectedLightBoxShadow.value, -40),
	}),
})
</script>

<style scoped>
.badge-switcher {
	display: grid;
	grid-template-columns: auto auto;
	grid-template-rows: auto auto;
	gap: 16px;
}
</style>
