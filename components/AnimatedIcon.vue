<!--
  AnimatedIcon.vue - Nuxt 3 Component
  
  A reusable animated icon component with configurable vibration,
  color transitions, and particle explosion effects.
  
  Usage:
  <AnimatedIcon 
    ref="iconRef"
    :icon="BanknotesIcon" 
    accent-color="#22c55e"
    :particle-count="70"
    :auto-trigger="false"
  />
  
  // Trigger programmatically:
  iconRef.value?.trigger()
-->
<template>
	<div
		class="relative inline-flex items-center justify-center"
		:style="cssVariables"
		:class="{ 'cursor-pointer': clickable }"
		@click="clickable && triggerAnimation()"
		:aria-label="label.toString() || 'Animated icon'"
	>
		<!-- 
      Dynamic icon component - accepts any Heroicon or custom SVG component
      Applies vibration animation classes and color transitions
    -->
		<component
			:is="icon"
			:class="['transition-colors duration-200', animationClass]"
			:style="{
				width: `${size}px`,
				height: `${size}px`,
				color: iconColor,
				filter:
					phase === 'explode'
						? `drop-shadow(0 0 12px ${props.label > -1 ? props.accentColor : '#c52222'})`
						: 'none',
			}"
		/>

		<!-- 
      Particle explosion effect
      Each particle is positioned absolutely and animated outward
    -->
		<span
			v-for="particle in particles"
			:key="particle.id"
			class="absolute top-1/2 left-1/2 rounded-full animate-particle"
			:style="{
				width: `${particle.size}px`,
				height: `${particle.size}px`,
				backgroundColor: props.label > -1 ? props.accentColor : '#c52222',
				boxShadow: `
          0 0 ${particle.size * 2}px ${props.label > -1 ? props.accentColor : '#c52222'}, 
          0 0 ${particle.size * 4}px ${props.label > -1 ? props.accentColor : '#c52222'}, 
          0 0 ${particle.size * 6}px ${props.label > -1 ? props.accentColor : '#c52222'}
        `,
				'--particle-x': `${Math.cos((particle.angle * Math.PI) / 180) * particle.distance}px`,
				'--particle-y': `${Math.sin((particle.angle * Math.PI) / 180) * particle.distance}px`,
				'--particle-duration': `${particleDuration}s`,
			}"
		/>
	</div>

	<!--  label next to the icon -->
	<span
		class="text-base text-gray-400 text-center"
		:class="['transition-colors duration-200', animationClass]"
		:style="{
			fontSize: '1rem',
			lineHeight: '1.5rem',
			color: iconColor,
			filter:
				phase === 'explode'
					? `drop-shadow(0 0 12px ${props.label > -1 ? props.accentColor : '#c52222'})`
					: 'none',
		}"
	>
		{{ formatCountToMs(label) }}
	</span>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type Component } from 'vue'
import { formatCountToMs } from '~/utils/numbers'

// ============================================
// TYPE DEFINITIONS
// ============================================

type AnimationPhase =
	| 'idle'
	| 'vibrate-slow'
	| 'vibrate-medium'
	| 'vibrate-fast'
	| 'vibrate-intense'
	| 'explode'

interface Particle {
	id: number
	angle: number
	distance: number
	size: number
}

// ============================================
// PROPS DEFINITION
// ============================================

interface Props {
	/** Vue component for the icon (e.g., Heroicon) */
	icon: Component
	/** Label displayed below the icon */
	label: number
	/** Accent color for animation and particles (hex) */
	accentColor?: string
	/** Idle color when not animating (hex) */
	idleColor?: string
	/** Number of particles in explosion */
	particleCount?: number
	/** Duration of particle animation in seconds */
	particleDuration?: number
	/** Minimum particle travel distance in pixels */
	particleDistanceMin?: number
	/** Maximum particle travel distance in pixels */
	particleDistanceMax?: number
	/** Duration of each vibration phase in milliseconds */
	vibrateDuration?: number
	/** Max translation amplitude in pixels */
	shakeAmplitude?: number
	/** Max rotation in degrees for intense phase */
	intenseRotation?: number
	/** Icon size in pixels */
	size?: number

	/** Whether clicking the icon triggers the animation (default: true) */
	clickable?: boolean
	/** Auto-trigger animation on mount */
	autoTrigger?: boolean
	/** Reactive trigger - watch this value and trigger when it changes */
	triggerOn?: number | string | boolean
}

const props = withDefaults(defineProps<Props>(), {
	label: undefined,
	accentColor: '#22c55e',
	idleColor: '#6b7280',
	particleCount: 70,
	particleDuration: 3,
	particleDistanceMin: 50,
	particleDistanceMax: 150,
	vibrateDuration: 300,
	shakeAmplitude: 1,
	intenseRotation: 15,
	size: 64,
	clickable: true,
	autoTrigger: false,
	triggerOn: undefined,
})

// ============================================
// EMITS
// ============================================

const emit = defineEmits<{
	(e: 'animation-complete'): void
	/** New event fired when animation starts */
	(e: 'animation-start'): void
}>()

// ============================================
// EXPOSE - Allow parent components to trigger animation
// ============================================

/**
 * Expose trigger method so parent can call it programmatically
 * Usage: const iconRef = ref(); iconRef.value?.trigger()
 */
defineExpose({
	trigger: () => triggerAnimation(),
	/** Check if animation is currently running */
	isAnimating: () => phase.value !== 'idle',
})

// ============================================
// REACTIVE STATE
// ============================================

const phase = ref<AnimationPhase>('idle')
const particles = ref<Particle[]>([])

// ============================================
// LIFECYCLE & WATCHERS
// ============================================

/**
 * Auto-trigger on mount if prop is set
 */
onMounted(() => {
	if (props.autoTrigger) {
		triggerAnimation()
	}
})

/**
 * Watch triggerOn prop - trigger animation when value changes
 * This allows parent to trigger by changing any reactive value
 */
watch(
	() => props.triggerOn,
	(newVal, oldVal) => {
		// Only trigger if value actually changed and is defined
		if (newVal !== undefined && newVal !== oldVal) {
			triggerAnimation()
		}
	}
)

// ============================================
// COMPUTED PROPERTIES
// ============================================

const cssVariables = computed(() => ({
	'--shake-amp': `${props.shakeAmplitude}px`,
	'--shake-amp-half': `${props.shakeAmplitude / 2}px`,
	'--rot-slow': '2deg',
	'--rot-medium': '4deg',
	'--rot-fast': `${Math.min(props.intenseRotation * 0.5, 8)}deg`,
	'--rot-intense': `${props.intenseRotation}deg`,
	'--particle-duration': `${props.particleDuration}s`,
}))

const iconColor = computed(() => {
	if (phase.value === 'idle') return props.idleColor
	if (phase.value === 'explode') return props.label > -1 ? props.accentColor : '#c52222'

	const phaseIndex = ['vibrate-slow', 'vibrate-medium', 'vibrate-fast', 'vibrate-intense'].indexOf(
		phase.value
	)
	const progress = phaseIndex / 3

	return progress > 0.5 ? (props.label > -1 ? props.accentColor : '#c52222') : props.idleColor
})

const animationClass = computed(() => {
	const classMap: Record<string, string> = {
		'vibrate-slow': 'animate-vibrate-slow',
		'vibrate-medium': 'animate-vibrate-medium',
		'vibrate-fast': 'animate-vibrate-fast',
		'vibrate-intense': 'animate-vibrate-intense',
	}
	return classMap[phase.value] || ''
})

// ============================================
// METHODS
// ============================================

/**
 * Triggers the full animation sequence
 * Can be called via click, ref.trigger(), autoTrigger, or triggerOn
 */
function triggerAnimation() {
	if (phase.value !== 'idle') return

	emit('animation-start')

	const phases: AnimationPhase[] = [
		'vibrate-slow',
		'vibrate-medium',
		'vibrate-fast',
		'vibrate-intense',
		'explode',
	]

	const durations = [
		props.vibrateDuration,
		props.vibrateDuration * 0.85,
		props.vibrateDuration * 0.7,
		props.vibrateDuration * 0.6,
		props.particleDuration * 1000,
	]

	let currentIndex = 0

	function runPhase() {
		phase.value = phases[currentIndex]

		if (phases[currentIndex] === 'explode') {
			particles.value = generateParticles()
		}

		currentIndex++

		if (currentIndex < phases.length) {
			setTimeout(runPhase, durations[currentIndex - 1])
		} else {
			setTimeout(
				() => {
					phase.value = 'idle'
					particles.value = []
					emit('animation-complete')
				},
				durations[durations.length - 1]
			)
		}
	}

	runPhase()
}

function generateParticles(): Particle[] {
	return Array.from({ length: props.particleCount }, (_, i) => ({
		id: i,
		angle: (i * 360) / props.particleCount + Math.random() * 5,
		distance:
			props.particleDistanceMin +
			Math.random() * (props.particleDistanceMax - props.particleDistanceMin),
		size: 2 + Math.random() * 8,
	}))
}
</script>

<style scoped>
/* ============================================
   VIBRATION KEYFRAMES
   
   Each phase has increasing intensity:
   - Slow: subtle shake, minimal rotation
   - Medium: slightly faster
   - Fast: more pronounced
   - Intense: maximum shake and rotation
   ============================================ */

@keyframes vibrate-slow {
	0%,
	100% {
		transform: translate(0, 0) rotate(0deg);
	}
	25% {
		transform: translate(calc(var(--shake-amp-half) * 0.3), calc(var(--shake-amp-half) * -0.3))
			rotate(var(--rot-slow));
	}
	50% {
		transform: translate(calc(var(--shake-amp-half) * -0.3), calc(var(--shake-amp-half) * 0.3))
			rotate(calc(var(--rot-slow) * -1));
	}
	75% {
		transform: translate(calc(var(--shake-amp-half) * 0.3), calc(var(--shake-amp-half) * 0.3))
			rotate(var(--rot-slow));
	}
}

@keyframes vibrate-medium {
	0%,
	100% {
		transform: translate(0, 0) rotate(0deg);
	}
	25% {
		transform: translate(calc(var(--shake-amp-half) * 0.5), calc(var(--shake-amp-half) * -0.5))
			rotate(var(--rot-medium));
	}
	50% {
		transform: translate(calc(var(--shake-amp-half) * -0.5), calc(var(--shake-amp-half) * 0.5))
			rotate(calc(var(--rot-medium) * -1));
	}
	75% {
		transform: translate(calc(var(--shake-amp-half) * 0.5), calc(var(--shake-amp-half) * 0.5))
			rotate(var(--rot-medium));
	}
}

@keyframes vibrate-fast {
	0%,
	100% {
		transform: translate(0, 0) rotate(0deg);
	}
	25% {
		transform: translate(calc(var(--shake-amp) * 0.7), calc(var(--shake-amp) * -0.7))
			rotate(var(--rot-fast));
	}
	50% {
		transform: translate(calc(var(--shake-amp) * -0.7), calc(var(--shake-amp) * 0.7))
			rotate(calc(var(--rot-fast) * -1));
	}
	75% {
		transform: translate(calc(var(--shake-amp) * 0.7), calc(var(--shake-amp) * 0.7))
			rotate(var(--rot-fast));
	}
}

@keyframes vibrate-intense {
	0%,
	100% {
		transform: translate(0, 0) rotate(0deg);
	}
	10% {
		transform: translate(var(--shake-amp), calc(var(--shake-amp) * -1)) rotate(var(--rot-intense));
	}
	20% {
		transform: translate(calc(var(--shake-amp) * -1), var(--shake-amp))
			rotate(calc(var(--rot-intense) * -1));
	}
	30% {
		transform: translate(var(--shake-amp), var(--shake-amp)) rotate(var(--rot-intense));
	}
	40% {
		transform: translate(calc(var(--shake-amp) * -1), calc(var(--shake-amp) * -1))
			rotate(calc(var(--rot-intense) * -1));
	}
	50% {
		transform: translate(var(--shake-amp), 0) rotate(var(--rot-intense));
	}
	60% {
		transform: translate(calc(var(--shake-amp) * -1), var(--shake-amp))
			rotate(calc(var(--rot-intense) * -1));
	}
	70% {
		transform: translate(var(--shake-amp), calc(var(--shake-amp) * -1)) rotate(var(--rot-intense));
	}
	80% {
		transform: translate(0, var(--shake-amp)) rotate(calc(var(--rot-intense) * -1));
	}
	90% {
		transform: translate(calc(var(--shake-amp) * -1), 0) rotate(var(--rot-intense));
	}
}

/* ============================================
   PARTICLE EXPLOSION KEYFRAME
   
   Particles start at center and move outward
   while fading out
   ============================================ */

@keyframes particle-explode {
	0% {
		transform: translate(-50%, -50%) translate(0, 0);
		opacity: 1;
	}
	100% {
		transform: translate(-50%, -50%) translate(var(--particle-x), var(--particle-y));
		opacity: 0;
	}
}

/* ============================================
   ANIMATION UTILITY CLASSES
   ============================================ */

.animate-vibrate-slow {
	animation: vibrate-slow 0.05s ease-in-out infinite;
}

.animate-vibrate-medium {
	animation: vibrate-medium 0.035s ease-in-out infinite;
}

.animate-vibrate-fast {
	animation: vibrate-fast 0.025s ease-in-out infinite;
}

.animate-vibrate-intense {
	animation: vibrate-intense 0.012s ease-in-out infinite;
}

.animate-particle {
	animation: particle-explode var(--particle-duration) ease-out forwards;
}
</style>
