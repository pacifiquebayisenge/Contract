<!-- components/ThemeSwitcher.vue -->
<template>
	<div class="theme-switcher justify-center py-5">
		<button
			v-for="themeOption in themeStore.themes"
			:key="themeOption"
			:class="{ active: themeStore.currentTheme === themeOption }"
			:style="{
				'--theme-color': themeStore.colorFor(themeOption),
				'--theme-color-dark': adjustColor(themeStore.colorFor(themeOption), -30),
			}"
			@click="changeTheme(themeOption)"
		>
			<span class="button-content">
				{{ themeOption.replace('-', ' ') }}
			</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { adjustColor } from '~/utils/color'

const themeStore = useThemeStore()

const changeTheme = (theme: ThemeName) => {
	themeStore.setTheme(theme)

	setTimeout(() => {
		window.location.reload()
	}, 100)
}
</script>

<style scoped>
.theme-switcher {
	display: flex;
	gap: 16px;
	flex-wrap: wrap;
}

button {
	position: relative;
	padding: 14px 28px;
	border: none;
	border-radius: 12px;
	cursor: pointer;
	color: white;
	text-transform: capitalize;
	font-weight: 600;
	font-size: 1.3rem;
	background-color: var(--theme-color);
	box-shadow:
		2px 5px 0 0 var(--theme-color-dark),
		0 10px 16px rgba(0, 0, 0, 0.3),
		inset -2px -2px 0 rgba(0, 0, 0, 0.2),
		inset 2px 2px 0 rgba(255, 255, 255, 0.2);
	transform: translateY(0);
	transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-content {
	display: block;
	position: relative;
	z-index: 1;
}

/* Hover effect - slight lift */
/* button:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 10px 0 var(--theme-color-dark), 0 14px 20px rgba(0, 0, 0, 0.35),
    inset -2px -2px 0 rgba(0, 0, 0, 0.2), inset 2px 2px 0 rgba(255, 255, 255, 0.2);
} */

/* Active/pressed effect - push down */
button:active:not(.active) {
	transform: translateY(6px);
	box-shadow:
		0 2px 0 var(--theme-color-dark),
		0 4px 8px rgba(0, 0, 0, 0.2),
		inset -1px -1px 0 rgba(0, 0, 0, 0.2),
		inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

/* Selected state */
button.active {
	transform: translateY(6px);
	box-shadow:
		0 2px 0 var(--theme-color-dark),
		0 4px 8px rgba(0, 0, 0, 0.2),
		inset -1px -1px 0 rgba(0, 0, 0, 0.2),
		inset 1px 1px 0 rgba(255, 255, 255, 0.1);
	animation: bounce 0.4s ease;
}

/* Focus styles for accessibility */
button:focus-visible {
	outline: 3px solid rgba(255, 255, 255, 0.5);
	outline-offset: 2px;
}
</style>
