import { computed, ref } from 'vue'
import { useUserStore } from '#imports'

type HeatmapItem = { date: string; count: number; userId: string }
type CreditPoint = [string, number]
type CreditSeries = { userId: string; data: CreditPoint[] }

function localYYYYMMDDFromTimestamp(ts: string) {
	return String(ts).slice(0, 10)
}

export function useStats() {
	const supabase = useSupabaseClient()
	const events = ref<any[]>([])
	const streakEvents = ref<any[]>([])
	const creditEvents = ref<any[]>([])
	const appOpenEvents = ref<any[]>([])
	const userStore = useUserStore()

	const load = async () => {
		const { data, error } = await supabase
			.from('user_events')
			.select('*')
			.order('created_at', { ascending: false })
			.range(0, 999)

		if (error) {
			events.value = []
			return
		}

		events.value = data || []
	}

	const loadStreakEvents = async () => {
		const now = new Date()
		const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

		const { data, error } = await supabase
			.from('user_events')
			.select('*')
			.eq('event_type', 'streak_use')
			.gte('created_at', firstDayOfLastMonth.toISOString())
			.lt('created_at', firstDayOfNextMonth.toISOString())
			.order('created_at', { ascending: true })

		if (error) {
			streakEvents.value = []
			return
		}

		streakEvents.value = data || []
	}

	const loadCreditEvents = async () => {
		const now = new Date()
		const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

		const { data, error } = await supabase
			.from('user_events')
			.select('*')
			.in('event_type', ['credit_gain', 'credit_spent'])
			.gte('created_at', firstDayOfLastMonth.toISOString())
			.lt('created_at', firstDayOfNextMonth.toISOString())
			.order('created_at', { ascending: true })

		if (error) {
			creditEvents.value = []
			return
		}

		creditEvents.value = data || []
	}

	const loadAppOpenEvents = async () => {
		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth() + 1
		const firstDayOfMonth = new Date(year, month - 1, 1)
		const firstDayOfNextMonth = new Date(year, month, 1)

		const { data, error } = await supabase
			.from('user_events')
			.select('*')
			.eq('event_type', 'app_open')
			.gte('created_at', firstDayOfMonth.toISOString())
			.lt('created_at', firstDayOfNextMonth.toISOString())
			.order('created_at', { ascending: true })

		if (error) {
			appOpenEvents.value = []
			return
		}

		appOpenEvents.value = data || []
	}

	const eventTypeCounts = computed(() => {
		const counts: Record<string, number> = {}
		for (const e of events.value) {
			counts[e.event_type] = (counts[e.event_type] || 0) + 1
		}
		return counts
	})

	// STREAK PER DAY - Last 2 months
	const streakPerDaySeries = computed(() => {
		const map: Record<string, Record<string, number>> = {}

		streakEvents.value
			.filter((e) => e.event_type === 'streak_use')
			.forEach((e) => {
				const userId = String(e.target_id ?? 'unknown')
				const day = localYYYYMMDDFromTimestamp(e.created_at)

				map[userId] ||= {}
				map[userId][day] = (map[userId][day] || 0) + 1
			})

		return Object.entries(map).map(([userId, dayMap]) => ({
			userId,
			data: Object.entries(dayMap)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([day, count]) => ({ day, count })),
		}))
	})

	// CREDIT BALANCE - Last 2 months
	const creditDailySeries = computed<CreditSeries[]>(() => {
		const now = new Date()

		// Last day is today
		const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		// Generate all days from start to today
		const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
		const days: string[] = []
		for (let d = new Date(start); d <= lastDay; d.setDate(d.getDate() + 1)) {
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			const dd = String(d.getDate()).padStart(2, '0')
			days.push(`${y}-${m}-${dd}`)
		}

		const rows = creditEvents.value
			.filter((e) => e.balance !== null && e.balance !== undefined)
			.slice()
			.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))

		const seed: Record<string, number | null> = {}
		const perDay: Record<string, Record<string, number>> = {}

		for (const e of rows) {
			const userId = String(e.target_id ?? 'unknown')
			const balance = Number(e.balance)
			if (!Number.isFinite(balance)) continue

			const createdAt = new Date(String(e.created_at))

			const y = createdAt.getFullYear()
			const m = String(createdAt.getMonth() + 1).padStart(2, '0')
			const dd = String(createdAt.getDate()).padStart(2, '0')
			const dayKey = `${y}-${m}-${dd}`

			perDay[userId] ||= {}
			perDay[userId][dayKey] = balance
		}

		const userIds = new Set<string>([...Object.keys(perDay)])

		const out: CreditSeries[] = []

		for (const userId of userIds) {
			const dayMap = perDay[userId] || {}
			let last: number | null = null

			const points: CreditPoint[] = []

			for (const day of days) {
				if (day in dayMap) last = dayMap[day]

				if (last === null) continue

				points.push([`${day}T23:59:59`, last])
			}

			out.push({ userId, data: points })
		}

		return out
	})

	// APP OPENS PER DAY (heatmap-ready shape)
	// APP OPENS PER DAY (heatmap-ready shape)
	const appOpensPerDay = computed<HeatmapItem[]>(() => {
		const map: Record<string, Record<string, number>> = {}

		appOpenEvents.value.forEach((e) => {
			const day = localYYYYMMDDFromTimestamp(e.created_at)
			const userId = e.actor_id

			map[userId] ||= {}
			map[userId][day] = (map[userId][day] || 0) + 1
		})

		const result: HeatmapItem[] = []
		Object.entries(map).forEach(([userId, dayMap]) => {
			Object.entries(dayMap).forEach(([date, count]) => {
				result.push({ date, count, userId })
			})
		})

		return result
	})

	const appOpensToday = computed(() => {
		let myAppOpensToday = 0

		const today = new Date().toISOString().slice(0, 10)

		appOpenEvents.value.forEach((e) => {
			const eventDate = e.created_at.slice(0, 10)
			if (eventDate === today && e.actor_id === userStore.userId) {
				myAppOpensToday++
			}
		})

		return myAppOpensToday
	})

	return {
		load,
		loadStreakEvents,
		loadCreditEvents,
		loadAppOpenEvents,
		streakPerDaySeries,
		creditDailySeries,
		appOpensPerDay,
		appOpensToday,
		eventTypeCounts,
	}
}
