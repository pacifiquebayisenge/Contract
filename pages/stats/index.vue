<template>
	<section ref="statsPage" class="stats-page">
		<div class="stats-cards">
			<StatCard title="Credit Balance" :value="currentCredit" />
			<StatCard title="Contracts Today" :value="activityReady ? todayStreaks : null" />
			<StatCard title="Total Violations" :value="totalViolations" />
		</div>

		<p v-if="loading" class="stats-status" role="status">Loading activity…</p>
		<div v-else-if="error" class="stats-status" role="alert">
			<p>{{ error }}</p>
			<n-button text @click="load">Try again</n-button>
		</div>
		<div v-else class="stats-charts">
			<ChartCard title="Credits This Month" subtitle="Your activity">
				<dl class="monthly-credits">
					<div class="credit-in"><dt>Gained</dt><dd>+{{ formatCredits(monthlyCredits.gained) }}</dd></div>
					<div class="credit-out"><dt>Spent</dt><dd>−{{ formatCredits(monthlyCredits.spent) }}</dd></div>
				</dl>
				<p v-if="rewardsReceived !== null || shopReady" class="monthly-detail">
					<span v-if="rewardsReceived !== null">Rewards received: {{ formatCredits(rewardsReceived) }}</span>
					<span v-if="shopReady">Shop purchases: {{ formatCredits(shopSummary.spent) }}</span>
				</p>
			</ChartCard>
			<ChartCard title="Shop Activity" subtitle="Both partners">
				<template v-if="shopReady">
					<dl class="shop-metrics">
						<div><dt>Bought this month</dt><dd>{{ shopSummary.bought }}</dd></div>
						<div><dt>Completed from this month</dt><dd>{{ shopSummary.completed }}</dd></div>
						<div><dt>Still owed</dt><dd>{{ shopSummary.owed }}</dd></div>
					</dl>
					<div class="shop-stats-footer">
						<p v-if="shopSummary.favorite">
							Most bought this month · <strong>{{ shopSummary.favorite.title }}</strong> ×{{ shopSummary.favorite.count }}
						</p>
						<NuxtLink :to="{ path: '/shop', query: { view: 'owed' } }">View owed</NuxtLink>
					</div>
				</template>
				<p v-else class="stats-status">Shop activity is unavailable.</p>
			</ChartCard>
			<ChartCard title="Credit Balance Over Time" subtitle="Last known balance per segment · This month and last month">
				<CreditLineChart v-if="creditSeries.length" :days="days" :data="creditSeries" />
				<p v-else class="stats-status">No credit history in this period.</p>
			</ChartCard>
			<ChartCard title="Contract Uses" subtitle="Last recorded day per segment · Today for the current segment">
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

const { days, loading, error, load, todayStreaks, streakSeries, creditSeries, appOpensPerDay, monthlyCredits, shopSummary, shopReady, rewardsReceived } = useStats()
const userStore = useUserStore()
const creditFormatter = new Intl.NumberFormat('en-US')
const formatCredits = (amount: number) => creditFormatter.format(amount).replace(/,/g, ' ')
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
.monthly-credits, .shop-metrics { display: grid; gap: 0.65rem; }
.monthly-credits { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.shop-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.monthly-credits > div, .shop-metrics > div { border-radius: 0.85rem; padding: 0.65rem; background: #f3eff9; }
.monthly-credits dt, .shop-metrics dt { font-size: 1.05rem; }
.monthly-credits dd, .shop-metrics dd { font-size: 1.45rem; font-weight: 700; }
.monthly-credits .credit-in { background: #e7f5ec; color: #326447; }
.monthly-credits .credit-out { background: #fbeaf0; color: #8c4561; }
.monthly-detail, .shop-stats-footer { display: flex; flex-wrap: wrap; gap: 0.45rem 1rem; margin-top: 0.8rem; }
.shop-stats-footer p { margin: 0; overflow-wrap: anywhere; }
.shop-stats-footer a { font-weight: 700; text-decoration: underline; }
</style>
