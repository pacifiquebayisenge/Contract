// Define your tabs with their order
const tabs = [
	{ name: 'Home', path: '/' },
	{ name: 'Contract', path: '/contract' },
	{ name: 'Memories', path: '/memories' },
	{ name: 'Stats', path: '/stats' },
]

// Track the previous and current tab index (module-level state)
let previousIndex = 0
let currentIndex = 0
let direction = 1

export function useTabTransition() {
	const updateDirection = (newTabName: string) => {
		const newIndex = tabs.findIndex((tab) => tab.name === newTabName)
		if (newIndex !== -1 && newIndex !== currentIndex) {
			previousIndex = currentIndex
			currentIndex = newIndex
			direction = newIndex >= previousIndex ? 1 : -1
		}
	}

	const setInitialTab = (tabName: string) => {
		const index = tabs.findIndex((tab) => tab.name === tabName)
		if (index !== -1) {
			previousIndex = index
			currentIndex = index
		}
	}

	const getDirection = () => direction

	return {
		tabs,
		getDirection,
		updateDirection,
		setInitialTab,
	}
}
