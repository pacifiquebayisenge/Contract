export type ThemeName = 'sage-green' | 'dark-blue' | 'light-pink'
export type LightThemeOptionName = 'light-color' | 'extra-light-color'
export type BadgeRingOption = 'inside' | 'outside'

type ColorMap = Record<ThemeName, string>

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

export const useThemeStore = defineStore('theme', () => {
	// State
	const currentTheme = ref<ThemeName>('sage-green')
	const currentLightThemeOption = ref<LightThemeOptionName>('light-color')
	const currentBadgeRingOption = ref<BadgeRingOption>('outside')
	const ready = ref(false)

	// Static lists
	const themes = THEMES
	const lightThemeOptions = LIGHT_THEME_OPTIONS
	const badgeRingOptions = BADGE_RING_OPTIONS

	// Colors for the active theme
	const themeColor = computed<string>(() => THEME_COLORS[currentTheme.value])
	const lightThemeColor = computed<string>(() => LIGHT_THEME_COLORS[currentTheme.value])
	const extraLightThemeColor = computed<string>(() => EXTRA_LIGHT_THEME_COLORS[currentTheme.value])

	const selectedLightThemeColor = computed<string>(() =>
		currentLightThemeOption.value === 'light-color'
			? LIGHT_THEME_COLORS[currentTheme.value]
			: EXTRA_LIGHT_THEME_COLORS[currentTheme.value]
	)

	// Box shadows for the active theme
	const themeBoxShadow = computed<string>(() => toBoxShadow(THEME_COLORS[currentTheme.value]))

	const lightThemeBoxShadow = computed<string>(() =>
		toBoxShadow(LIGHT_THEME_COLORS[currentTheme.value])
	)

	const extraLightThemeBoxShadow = computed<string>(() =>
		toBoxShadow(EXTRA_LIGHT_THEME_COLORS[currentTheme.value])
	)

	const selectedLightThemeBoxShadow = computed<string>(() =>
		currentLightThemeOption.value === 'light-color'
			? toBoxShadow(LIGHT_THEME_COLORS[currentTheme.value])
			: toBoxShadow(EXTRA_LIGHT_THEME_COLORS[currentTheme.value])
	)

	// Color lookup by name (for pickers/previews)
	const colorFor = (name: ThemeName): string => THEME_COLORS[name]
	const lightColorFor = (name: ThemeName): string => LIGHT_THEME_COLORS[name]
	const extraLightColorFor = (name: ThemeName): string => EXTRA_LIGHT_THEME_COLORS[name]

	const isInsideBadgeRing = computed<boolean>(() => currentBadgeRingOption.value === 'inside')

	// Actions
	function setTheme(theme: ThemeName): void {
		if (!THEMES.includes(theme)) return

		currentTheme.value = theme

		if (import.meta.client) {
			localStorage.setItem('selected-theme', theme)

			document.documentElement.setAttribute('data-theme', theme)

			const pageColor = selectedLightThemeColor.value

			document.body.style.backgroundColor = pageColor

			document.documentElement.style.backgroundColor = pageColor

			let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')

			if (!meta) {
				meta = document.createElement('meta')
				meta.name = 'theme-color'
				document.head.appendChild(meta)
			}

			meta.content = pageColor
		}
	}

	function setLightThemeOption(option: LightThemeOptionName): void {
		if (!LIGHT_THEME_OPTIONS.includes(option)) return
		currentLightThemeOption.value = option
		if (import.meta.client) localStorage.setItem('selected-light-theme-option', option)
	}

	function setBadgeRingOption(option: BadgeRingOption): void {
		if (!BADGE_RING_OPTIONS.includes(option)) return
		currentBadgeRingOption.value = option
		if (import.meta.client) localStorage.setItem('selected-badge-ring-option', option)
	}

	function init(): void {
		if (!import.meta.client) return

		const saved = {
			theme: localStorage.getItem('selected-theme') as ThemeName,
			lightThemeOption: localStorage.getItem('selected-light-theme-option') as LightThemeOptionName,
			badgeRingOption: localStorage.getItem('selected-badge-ring-option') as BadgeRingOption,
		}

		setTheme(THEMES.includes(saved.theme) ? saved.theme : currentTheme.value)

		setLightThemeOption(
			LIGHT_THEME_OPTIONS.includes(saved.lightThemeOption)
				? saved.lightThemeOption
				: currentLightThemeOption.value
		)

		setBadgeRingOption(
			BADGE_RING_OPTIONS.includes(saved.badgeRingOption)
				? saved.badgeRingOption
				: currentBadgeRingOption.value
		)
	}

	return {
		// State
		currentTheme,
		currentLightThemeOption,
		currentBadgeRingOption,
		ready,
		// Static lists
		themes,
		lightThemeOptions,
		badgeRingOptions,
		// Computed colors
		themeColor,
		lightThemeColor,
		extraLightThemeColor,
		selectedLightThemeColor,
		// Computed box shadows
		themeBoxShadow,
		lightThemeBoxShadow,
		extraLightThemeBoxShadow,
		selectedLightThemeBoxShadow,
		// Color lookup functions
		colorFor,
		lightColorFor,
		extraLightColorFor,
		// Computed flags
		isInsideBadgeRing,
		// Actions
		setTheme,
		setLightThemeOption,
		setBadgeRingOption,
		init,
	}
})
