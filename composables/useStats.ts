import { computed, ref } from 'vue'

type HeatmapItem = { date: string; count: number }
type StreakItem = { day: string; count: number }

function localYYYYMMDDFromTimestamp(ts: string) {
	// If created_at is already an ISO string, slice(0,10) is OK,
	// but keep it consistent:
	return String(ts).slice(0, 10)
}

export function useStats() {
	const supabase = useSupabaseClient()
	const events = ref<any[]>([])

	const load = async () => {
		const { data, error } = await supabase.from('user_events').select('*').order('created_at')

		if (error) {
			console.error('Failed to load user_events:', error)
			events.value = []
			return
		}

		console.log('Loaded user_events rows:', data?.length ?? 0)
		events.value = data || []
	}

	const eventTypeCounts = computed(() => {
		const counts: Record<string, number> = {}
		for (const e of events.value) {
			counts[e.event_type] = (counts[e.event_type] || 0) + 1
		}
		return counts
	})

	// STREAK PER DAY
	const streakPerDay = computed<StreakItem[]>(() => {
		const map: Record<string, number> = {}

		events.value
			.filter((e) => e.event_type === 'streak_use')
			.forEach((e) => {
				const day = localYYYYMMDDFromTimestamp(e.created_at)
				map[day] = (map[day] || 0) + 1
			})

		return Object.entries(map).map(([day, count]) => ({ day, count }))
	})

	// CREDIT BALANCE (timeline points)
	const creditTimeline = computed<[string, number][]>(() => {
		let balance = 0

		return events.value
			.filter((e) => ['credit_gain', 'credit_spent'].includes(e.event_type))
			.map((e) => {
				const amount = Number(e.amount) || 0
				balance += e.event_type === 'credit_gain' ? amount : -amount
				return [String(e.created_at), balance] as [string, number]
			})
	})

	// APP OPENS PER DAY (heatmap-ready shape)
	const appOpensPerDay = computed<HeatmapItem[]>(() => {
		const map: Record<string, number> = {}

		events.value
			.filter((e) => e.event_type === 'app_open')
			.forEach((e) => {
				const day = localYYYYMMDDFromTimestamp(e.created_at)
				map[day] = (map[day] || 0) + 1
			})

		return Object.entries(map).map(([date, count]) => ({
			date,
			count,
		}))
	})

	return {
		load,
		streakPerDay,
		creditTimeline,
		appOpensPerDay,
		eventTypeCounts,
	}
}
