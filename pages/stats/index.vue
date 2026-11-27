<template>
	<section ref="statsPage" class="stats-page">
		<div class="stats-cards">
			<StatCard title="Credit Balance" :value="currentCredit" />
			<StatCard title="Contracts Today" :value="activityReady ? todayStreaks : null" />
			<StatCard title="Total Violations" :value="totalViolations" />
			<StatCard title="App Opens Today" :value="activityReady ? appOpensToday : null" />
		</div>

		<p v-if="loading" class="stats-status" role="status">Loading activity…</p>
		<div v-else-if="error" class="stats-status" role="alert">
			<p>{{ error }}</p>
			<n-button text @click="load">Try again</n-button>
		</div>
		<div v-else class="stats-charts">
			<ChartCard title="Credit Balance Over Time" subtitle="Daily balance · This month and last month">
				<CreditLineChart v-if="creditSeries.length" :days="days" :data="creditSeries" />
				<p v-else class="stats-status">No credit history in this period.</p>
			</ChartCard>
			<ChartCard title="Contract Uses per Day" subtitle="The first 3 uses per day are free">
				<StreakLineChart v-if="streakSeries.length" :days="days" :data="streakSeries" />
				<p v-else class="stats-status">No Contract uses in this period.</p>
			</ChartCard>
			<ChartCard title="App Opens" subtitle="This month · Both partners combined">
				<SeenHeatmap v-if="appOpensPerDay.length" :data="appOpensPerDay" />
				<p v-else class="stats-status">No app opens recorded this month.</p>
			</ChartCard>
		</div>
	</section>
</template>

<script setup lang="ts">
import { usePageAnimation } from '~/composables/usePageAnimation'
import { useStats } from '~/composables/useStats'
import { useUserStore } from '~/stores/user'

const { days, loading, error, load, todayStreaks, streakSeries, creditSeries, appOpensPerDay, appOpensToday } = useStats()
const userStore = useUserStore()
const currentCredit = computed(() => userStore.profile?.credit ?? null)
const totalViolations = computed(() => userStore.profile?.violation ?? null)
const activityReady = computed(() => !loading.value && !error.value)

const statsPage = ref<HTMLElement | null>(null)
const { animatePageEnter } = usePageAnimation()

onMounted(() => {
	if (statsPage.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		animatePageEnter(statsPage.value)
	}
})
</script>

<style scoped>
.stats-page {
	display: grid;
	align-content: start;
	gap: 1.25rem;
	height: 100%;
	max-width: 52rem;
	margin: 0 auto;
	overflow-y: auto;
	padding: 0.4rem 0.4rem 10rem;
}

.stats-cards {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
}

.stats-charts { display: grid; gap: 1rem; min-width: 0; }
.stats-status { padding: 0.75rem 0; text-align: center; color: #64748b; }
</style>
