<template>
	<div class="stats-page-container animate-item invisible-scroll">
		<div v-if="false" class="content animate-item">
			<div class="avatar-container py-8 animate-item">
				<!-- Left mirrored avatar -->
				<div class="avatar-image mirror animate-item">
					<n-image
						style="transform: rotate(5deg) scaleX(-1)"
						width="80"
						src="/memojis/jeje/thinking.png"
						class="animate-item"
					/>
				</div>

				<!-- Right avatar -->
				<div class="avatar-image animate-item">
					<n-image
						style="transform: rotate(3deg)"
						width="81"
						src="/memojis/paci/thinking.png"
						class="animate-item"
					/>
				</div>

				<!-- Shadows (anchored to floor) -->
				<div class="avatar-shadow left animate-item"></div>
				<div class="avatar-shadow right animate-item"></div>
			</div>

			<p class="title">Please wait ...</p>
			<p class="comm">Not enough <strong class="special"> data </strong> yet</p>
		</div>

		<!-- SUMMARY CARDS -->
		<div class="stats-cards">
			<StatCard title="Today's Contract Uses" :value="todayStreaks" />
			<StatCard title="Credit Balance" :value="currentCredit + ' €'" />
			<StatCard title="Total Violations" :value="totalViolations" />
			<StatCard title="App Opens Today" :value="todayOpens" />
		</div>

		<!-- CHARTS -->
		<div class="charts">
			<ChartCard title="Contract Usage per Day">
				<StreakBarChart :data="streakPerDay" />
			</ChartCard>

			<ChartCard title="Credit Over Time">
				<CreditLineChart :data="creditTimeline" />
			</ChartCard>

			<ChartCard title="App Opens (Heatmap)">
				<SeenHeatmap :data="appOpensPerDay" />
			</ChartCard>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import ChartCard from '~/components/ChartCard.vue'
import CreditLineChart from '~/components/CreditLineChart.vue'
import SeenHeatmap from '~/components/SeenHeatmap.vue'
import StatCard from '~/components/StatCard.vue'
import StreakBarChart from '~/components/StreakBarChart.vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useStats } from '~/composables/useStats'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

const { load, streakPerDay, creditTimeline, appOpensPerDay, eventTypeCounts } = useStats()
const userStore = useUserStore()

const themeStore = useThemeStore()

function localYYYYMMDD(d = new Date()) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}
const today = localYYYYMMDD()

const todayStreaks = computed(() => streakPerDay.value.find((d) => d.day === today)?.count ?? 0)

const todayOpens = computed(() => appOpensPerDay.value.find((d) => d.date === today)?.count ?? 0)
const currentCredit = computed(() => userStore.profile?.credit ?? 0)
const totalViolations = computed(() => userStore.profile?.violation ?? 0)

const currentLightThemeColor = computed(() =>
	themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
		? themeStore.getCurrentLightThemeColor
		: themeStore.getCurrentExtraLightThemeColor
)

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)

const { animatePageEnter } = usePageAnimation()

onMounted(async () => {
	animatePageEnter() // <-- THIS TRIGGERS THE ANIMATION

	await load()
	console.log('eventTypeCounts', eventTypeCounts.value)
	console.log('streakPerDay points', streakPerDay.value.length)
	console.log('creditTimeline points', creditTimeline.value.length)
	console.log('appOpensPerDay points', appOpensPerDay.value.length)
})
</script>

<style lang="scss" scoped>
.stats-page-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 2rem;
	// padding-bottom: 10rem;
	width: 100%;
	padding-bottom: 25rem;

	/* AVATAR SECTION */
	.avatar-container {
		position: relative;
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 2rem;

		&::before {
			content: '';
			position: absolute;
			bottom: -2rem;
			left: 50%;
			transform: translateX(-50%);
			width: 120%;
			height: 3rem;
			background: v-bind(currentLightThemeColor);
			border-radius: 50%;
			filter: blur(0.3rem);
			opacity: 0.6;
		}

		.avatar-image {
			position: relative;
			z-index: 2;
			animation: float 3.5s ease-in-out infinite;
			img {
				display: block;
				max-width: 80px;
				height: auto;
			}

			&.mirror img {
				transform: scaleX(-1);
			}
		}

		.avatar-shadow {
			position: absolute;
			bottom: -1.5rem;
			width: 5rem;
			height: 1rem;
			background: rgba(0, 0, 0, 0.3);
			border-radius: 50%;
			filter: blur(0.3rem);
			animation: shadow 3.5s ease-in-out infinite;

			&.left {
				left: calc(50% - 6rem);
			}
			&.right {
				left: calc(50% + 1rem);
			}
		}
	}

	/* TITLES */
	.title {
		text-align: center;
		margin-top: 2rem;
		font-size: 1.6rem;
		font-weight: 600;
	}

	.comm {
		text-align: center;
		font-weight: 500;
		margin-top: 0.5rem;

		.special {
			color: v-bind(currentThemeColor);
		}
	}

	/* SUMMARY CARDS */
	.stats-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		width: 100%;
		margin-top: 2rem;
	}

	/* CHARTS */
	.charts {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		width: 100%;
		margin-top: 2rem;
	}
}

/* FLOAT & SHADOW ANIMATIONS */
@keyframes float {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-0.8rem);
	}
}

@keyframes shadow {
	0%,
	100% {
		transform: scale(1.1);
		opacity: 0.7;
	}
	50% {
		transform: scale(0.9);
		opacity: 0.45;
	}
}

/* MEDIA QUERIES */
@media (max-width: 768px) {
	.avatar-container {
		flex-direction: column;
		gap: 1rem;

		.avatar-shadow.left,
		.avatar-shadow.right {
			display: none;
		}
	}

	.title {
		font-size: 1.4rem;
	}

	.comm {
		font-size: 0.9rem;
	}

	.stats-cards {
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
	}

	.charts {
		gap: 1rem;
	}
}

@media (max-width: 480px) {
	.title {
		font-size: 1.2rem;
	}

	.comm {
		font-size: 0.85rem;
	}

	.stats-cards {
		grid-template-columns: 1fr 1fr;
	}
}
</style>
