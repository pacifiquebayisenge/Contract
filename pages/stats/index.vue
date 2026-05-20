<template>
	<div class="stats-page-container animate-item invisible-scroll">
		<!-- SUMMARY CARDS -->
		<div class="stats-cards m-[5px]">
			<StatCard title="Today's Contract Uses" :value="todayStreaks" />
			<StatCard title="Credit Balance" :value="currentCredit" :currency="true" />

			<StatCard title="Total Violations" :value="totalViolations" />
			<StatCard title="App Opens Today" :value="appOpensToday" />
		</div>

		<!-- CHARTS -->
		<div class="charts">
			<ChartCard title="Contract Usage per Day">
				<StreakLineChart :data="streakPerDaySeries" />
			</ChartCard>

			<ChartCard title="Credit Over Time">
				<CreditLineChart :data="creditDailySeries" />
			</ChartCard>

			<ChartCard title="App Opens for this Month">
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
import StreakLineChart from '~/components/StreakLineChart.vue'
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useStats } from '~/composables/useStats'
// import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

const {
	load,
	loadStreakEvents,
	loadCreditEvents,
	loadAppOpenEvents,

	streakPerDaySeries,
	creditDailySeries,
	appOpensPerDay,
	eventTypeCounts,
	appOpensToday,
} = useStats()

const userStore = useUserStore()

// for the current user
const todayStreaks = computed(() => userStore.profile?.streak ?? 0)
const currentCredit = computed(() => userStore.profile?.credit ?? 0)

const totalViolations = computed(() => userStore.profile?.violation ?? 0)

const { animatePageEnter } = usePageAnimation()

onMounted(async () => {
	animatePageEnter()

	await load()
	await loadStreakEvents()
	await loadCreditEvents()
	await loadAppOpenEvents()

	// console.log('📈 appOpensPerDay:', appOpensPerDay.value)
	// console.log('📊 eventTypeCounts:', eventTypeCounts.value)
	// console.log('📈 streakPerDay points:', streakPerDaySeries.value.length)
	// console.log('💰 creditTimeline points:', creditDailySeries.value.length)
	// console.log('📱 appOpensPerDay points:', appOpensPerDay.value.length)
})
</script>

<style lang="scss" scoped>
.stats-page-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;

	width: 100%;
	padding-bottom: 25rem;

	.stats-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		width: 100%;
	}

	.charts {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.5rem;
		width: 100%;
	}
}
</style>
