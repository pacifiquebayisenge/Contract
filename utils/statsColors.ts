import type { ThemeName } from '~/stores/theme'

const userColors: Record<ThemeName, string> = {
	'sage-green': '#9bb89f',
	'dark-blue': '#839bd8',
	'light-pink': '#db92b8',
}

export function statsSeriesColor(theme: ThemeName, isCurrentUser: boolean) {
	return isCurrentUser ? userColors[theme] : '#f5a96e'
}
