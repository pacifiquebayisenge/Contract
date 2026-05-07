import { defineStore } from 'pinia'

export type ThemeName = 'sage-green' | 'dark-blue' | 'light-pink'
export type LightThemeOptionName = 'light-color' | 'extra-light-color'
export type BadgeRingOption = 'inside' | 'outside'

type ColorMap = Record<ThemeName, string>

interface ThemeState {
	currentTheme: ThemeName
	currentLightThemeOption: LightThemeOptionName
	currentBadgeRingOption: BadgeRingOption
	ready: boolean
}

const THEMES: ThemeName[] = ['sage-green', 'dark-blue', 'light-pink']
const LIGHT_THEME_OPTIONS: LightThemeOptionName[] = ['light-color', 'extra-light-color']
const BADGE_RING_OPTIONS: BadgeRingOption[] = ['inside', 'outside']

const THEME_COLORS: ColorMap = {
	'sage-green': '#8A9A86',
	'dark-blue': '#1E3A8A',
	'light-pink': '#FAD0E8',
}

const LIGHT_THEME_COLORS: ColorMap = {
	'sage-green': '#D4DDD2',
	'dark-blue': '#B8C5E0',
	'light-pink': '#FCEEF6',
}

const EXTRA_LIGHT_THEME_COLORS: ColorMap = {
	'sage-green': '#E3E9E2',
	'dark-blue': '#D4DCF0',
	'light-pink': '#FEF6FA',
}

const toBoxShadow = (color: string) => `0 0 0 2px ${color}40`

export const useThemeStore = defineStore('theme', {
	state: (): ThemeState => ({
		currentTheme: 'sage-green',
		currentLightThemeOption: 'light-color',
		currentBadgeRingOption: 'outside',
		ready: false,
	}),

	getters: {
		// Static lists (no longer need to live in state)
		themes: () => THEMES,
		lightThemeOptions: () => LIGHT_THEME_OPTIONS,
		badgeRingOptions: () => BADGE_RING_OPTIONS,

		// Colors for the active theme
		themeColor: (state): string => THEME_COLORS[state.currentTheme],
		lightThemeColor: (state): string => LIGHT_THEME_COLORS[state.currentTheme],
		extraLightThemeColor: (state): string => EXTRA_LIGHT_THEME_COLORS[state.currentTheme],
		selectedLightThemeColor: (state): string =>
			state.currentLightThemeOption === 'light-color'
				? LIGHT_THEME_COLORS[state.currentTheme]
				: EXTRA_LIGHT_THEME_COLORS[state.currentTheme],

		// Box shadows for the active theme
		themeBoxShadow: (state): string => toBoxShadow(THEME_COLORS[state.currentTheme]),
		lightThemeBoxShadow: (state): string => toBoxShadow(LIGHT_THEME_COLORS[state.currentTheme]),
		extraLightThemeBoxShadow: (state): string =>
			toBoxShadow(EXTRA_LIGHT_THEME_COLORS[state.currentTheme]),
		selectedLightThemeBoxShadow: (state): string =>
			state.currentLightThemeOption === 'light-color'
				? toBoxShadow(LIGHT_THEME_COLORS[state.currentTheme])
				: toBoxShadow(EXTRA_LIGHT_THEME_COLORS[state.currentTheme]),

		// Color lookup by name (for pickers/previews)
		colorFor: () => (name: ThemeName) => THEME_COLORS[name],
		lightColorFor: () => (name: ThemeName) => LIGHT_THEME_COLORS[name],
		extraLightColorFor: () => (name: ThemeName) => EXTRA_LIGHT_THEME_COLORS[name],

		isInsideBadgeRing: (state): boolean => state.currentBadgeRingOption === 'inside',
	},

	actions: {
		setTheme(theme: ThemeName): void {
			if (!THEMES.includes(theme)) return
			this.currentTheme = theme

			if (import.meta.client) {
				localStorage.setItem('selected-theme', theme)
				document.documentElement.setAttribute('data-theme', theme)
				document.body.style.backgroundColor = THEME_COLORS[theme]

				const meta =
					document.querySelector<HTMLMetaElement>('meta[name="theme-color"]') ??
					Object.assign(document.createElement('meta'), { name: 'theme-color' })

				if (!document.head.contains(meta)) document.head.appendChild(meta)
				meta.content = THEME_COLORS[theme]
			}
		},

		setLightThemeOption(option: LightThemeOptionName): void {
			if (!LIGHT_THEME_OPTIONS.includes(option)) return
			this.currentLightThemeOption = option
			if (import.meta.client) localStorage.setItem('selected-light-theme-option', option)
		},

		setBadgeRingOption(option: BadgeRingOption): void {
			if (!BADGE_RING_OPTIONS.includes(option)) return
			this.currentBadgeRingOption = option
			if (import.meta.client) localStorage.setItem('selected-badge-ring-option', option)
		},

		init(): void {
			if (!import.meta.client) return

			const saved = {
				theme: localStorage.getItem('selected-theme') as ThemeName,
				lightThemeOption: localStorage.getItem(
					'selected-light-theme-option'
				) as LightThemeOptionName,
				badgeRingOption: localStorage.getItem('selected-badge-ring-option') as BadgeRingOption,
			}

			this.setTheme(THEMES.includes(saved.theme) ? saved.theme : this.currentTheme)
			this.setLightThemeOption(
				LIGHT_THEME_OPTIONS.includes(saved.lightThemeOption)
					? saved.lightThemeOption
					: this.currentLightThemeOption
			)
			this.setBadgeRingOption(
				BADGE_RING_OPTIONS.includes(saved.badgeRingOption)
					? saved.badgeRingOption
					: this.currentBadgeRingOption
			)
		},
	},
})
