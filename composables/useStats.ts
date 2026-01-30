import { computed, ref } from 'vue'

type HeatmapItem = { date: string; count: number }
type CreditPoint = [string, number]
type CreditSeries = { userId: string; data: CreditPoint[] }

function localYYYYMMDDFromTimestamp(ts: string) {
	return String(ts).slice(0, 10)
}

export function useStats() {
	const supabase = useSupabaseClient()
	const events = ref<any[]>([])

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

		// Log app_open events specifically
		const appOpenEvents = data?.filter((e: any) => e.event_type === 'app_open') || []

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
	const streakPerDaySeries = computed(() => {
		const map: Record<string, Record<string, number>> = {}

		events.value
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

	// CREDIT BALANCE (timeline points)
	const creditDailySeries = computed<CreditSeries[]>(() => {
		const now = new Date()
		const start = new Date(now.getFullYear(), now.getMonth(), 1)
		const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
		const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

		const days: string[] = []
		for (let d = new Date(start); d <= lastDay; d.setDate(d.getDate() + 1)) {
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			const dd = String(d.getDate()).padStart(2, '0')
			days.push(`${y}-${m}-${dd}`)
		}

		const rows = events.value
			.filter((e) => ['credit_gain', 'credit_spent'].includes(e.event_type))
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

			if (createdAt < start) {
				seed[userId] = balance
				continue
			}

			if (createdAt >= end) continue

			const y = createdAt.getFullYear()
			const m = String(createdAt.getMonth() + 1).padStart(2, '0')
			const dd = String(createdAt.getDate()).padStart(2, '0')
			const dayKey = `${y}-${m}-${dd}`

			perDay[userId] ||= {}
			perDay[userId][dayKey] = balance
		}

		const userIds = new Set<string>([...Object.keys(seed), ...Object.keys(perDay)])

		const out: CreditSeries[] = []

		for (const userId of userIds) {
			const dayMap = perDay[userId] || {}
			let last: number | null = seed[userId] ?? null

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
	const appOpensPerDay = computed<HeatmapItem[]>(() => {
		const map: Record<string, number> = {}

		const appOpenEvents = events.value.filter((e) => e.event_type === 'app_open')

		appOpenEvents.forEach((e) => {
			const day = localYYYYMMDDFromTimestamp(e.created_at)
			map[day] = (map[day] || 0) + 1
		})

		const result = Object.entries(map).map(([date, count]) => ({
			date,
			count,
		}))

		return result
	})

	return {
		load,
		streakPerDaySeries,
		creditDailySeries,
		appOpensPerDay,
		eventTypeCounts,
	}
}
