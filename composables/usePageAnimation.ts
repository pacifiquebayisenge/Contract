// Pure Anime.js page animation composable
import { useNuxtApp } from '#app'
import { useTabTransition } from './useTabTransition'

export function usePageAnimation() {
	const { $anime } = useNuxtApp()
	const { getDirection } = useTabTransition()

	/**
	 * Call this in your page's onMounted()
	 * It animates all elements with class "animate-item"
	 */
	const animatePageEnter = () => {
		const dir = getDirection()
		const items = document.querySelectorAll('.animate-item')

		if (!items.length) return

		// Reset items to starting position
		$anime.set(items, {
			opacity: 0,
			translateX: 60 * dir,
			translateY: 20,
			rotateZ: 3 * dir,
		})

		// Animate items with stagger
		$anime({
			targets: items,
			opacity: [0, 1],
			translateX: [60 * dir, 0],
			translateY: [20, 0],
			rotateZ: [3 * dir, 0],
			duration: 600,
			delay: $anime.stagger(80),
			easing: 'easeOutElastic(1, 0.6)',
		})
	}

	return {
		animatePageEnter,
	}
}
