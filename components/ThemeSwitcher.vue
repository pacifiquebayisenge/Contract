<!-- components/ThemeSwitcher.vue -->
<template>
	<div class="theme-switcher" role="group" aria-label="Color palette">
		<button
			v-for="themeOption in themeStore.themes"
			:key="themeOption"
			type="button"
			:aria-pressed="themeStore.currentTheme === themeOption"
			:style="{
				'--theme-color': themeStore.colorFor(themeOption),
				'--swatch-background': themeStore.extraLightColorFor(themeOption),
			}"
			@click="changeTheme(themeOption)"
		>
			<span class="palette-dot" aria-hidden="true"></span>
			<span>
				{{ themeOption.replace('-', ' ') }}
			</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { useThemeStore, type ThemeName } from '~/stores/theme'

const themeStore = useThemeStore()

const changeTheme = (theme: ThemeName) => {
	themeStore.setTheme(theme)

	setTimeout(() => {
		window.location.reload()
	}, 100)
}
</script>

<style scoped>
.theme-switcher { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.5rem; }
button {
	display: grid;
	justify-items: center;
	gap: 0.4rem;
	min-height: 4rem;
	padding: 0.55rem 0.2rem;
	border: 1px solid color-mix(in srgb, var(--theme-color) 35%, white);
	border-radius: 0.8rem;
	background: var(--swatch-background);
	color: #344054;
	font-weight: 600;
	text-transform: capitalize;
}
button[aria-pressed='true'] { box-shadow: inset 0 0 0 1px var(--theme-color); }
button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 3px; }
.palette-dot { width: 1rem; height: 1rem; border-radius: 50%; background: var(--theme-color); }
</style>
