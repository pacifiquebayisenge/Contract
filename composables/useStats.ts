import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import type { Database } from '~/types/supabase.types'

const TIME_ZONE = 'Europe/Brussels'
const PAGE_SIZE = 500
const EVENT_TYPES = ['streak_use', 'credit_gain', 'credit_spent', 'app_open']

type Event = Pick<Database['public']['Tables']['user_events']['Row'],
	'actor_id' | 'target_id' | 'event_type' | 'created_at' | 'balance' | 'amount'>
export type StatsSeries = {
	userId: string
	values: (number | null)[]
}

function dayKey(date: string | Date) {
	return formatInTimeZone(date, TIME_ZONE, 'yyyy-MM-dd')
}

function monthStart(today: string, offset: number) {
	const [year, month] = today.split('-').map(Number)
	return new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 10)
}

function daysBetween(start: string, end: string) {
	const days: string[] = []
	const date = new Date(start)

	for (; date.toISOString().slice(0, 10) <= end; date.setUTCDate(date.getUTCDate() + 1)) {
		days.push(date.toISOString().slice(0, 10))
	}

	return days
}

function countByDay(events: Event[], userKey: 'actor_id' | 'target_id') {
	const counts = new Map<string, number>()
	for (const event of events) {
		if (!event.created_at) continue
		const key = `${event[userKey]}:${dayKey(event.created_at)}`
		counts.set(key, (counts.get(key) ?? 0) + 1)
	}
	return counts
}

export function useStats() {
	const supabase = useSupabaseClient<Database>()
	const userStore = useUserStore()
	const user = useSupabaseUser()
	const events = ref<Event[]>([])
	const purchases = ref<Pick<Database['public']['Tables']['shop_items']['Row'],
		'id' | 'source_item_id' | 'title' | 'kind' | 'creator_id' | 'partner_id' | 'status' | 'price' | 'accepted_at'>[]>([])
	const rewardsReceived = ref<number | null>(null)
	const lastContractUse = ref<string | null>(null)
	const shopReady = ref(false)
	const loading = ref(true)
	const error = ref('')
	const today = ref(dayKey(new Date()))
	const start = computed(() => monthStart(today.value, -1))
	const days = computed(() => daysBetween(start.value, today.value))
	const userIds = computed(() => [user.value?.sub, userStore.partnerProfile?.id]
		.filter((id): id is string => !!id))
	let latestRequest = 0

	async function load() {
		if (!userIds.value.length) return
		const request = ++latestRequest
		const participants = userIds.value
		const now = new Date()
		today.value = dayKey(now)
		const rangeStart = fromZonedTime(start.value + 'T00:00:00', TIME_ZONE).toISOString()
		loading.value = true
		error.value = ''

		try {
			const rows: Event[] = []
			// Supabase caps query results, so fetch the date range in stable pages.
			for (let offset = 0; ; offset += PAGE_SIZE) {
				const { data, error: failure } = await supabase.from('user_events')
					.select('actor_id, target_id, event_type, created_at, balance, amount')
					.in('event_type', EVENT_TYPES)
					.in('target_id', participants)
					.gte('created_at', rangeStart)
					.lte('created_at', now.toISOString())
					.order('created_at', { ascending: true })
					.order('id', { ascending: true })
					.range(offset, offset + PAGE_SIZE - 1)
				if (request !== latestRequest) return
				if (failure) throw failure
				rows.push(...data)
				if (data.length < PAGE_SIZE) break
			}
			const month = fromZonedTime(monthStart(today.value, 0) + 'T00:00:00', TIME_ZONE).toISOString()
			const [shop, rewards, lastContract] = await Promise.all([
				supabase.from('shop_items')
					.select('id, source_item_id, title, kind, creator_id, partner_id, status, price, accepted_at')
					.or(`status.eq.accepted,accepted_at.gte.${month}`)
					.order('accepted_at', { ascending: false }),
				supabase.from('credit_increases').select('amount')
					.eq('receiver_id', participants[0]).gte('created_at', month),
				supabase.from('user_events').select('created_at')
					.eq('target_id', participants[0]).eq('event_type', 'streak_use')
					.lte('created_at', now.toISOString())
					.order('created_at', { ascending: false }).limit(1).maybeSingle(),
			])
			if (request !== latestRequest) return

			events.value = rows
			purchases.value = shop.data ?? []
			lastContractUse.value = lastContract.data?.created_at ?? null
			shopReady.value = !shop.error
			rewardsReceived.value = rewards.data?.reduce((total, reward) => total + reward.amount, 0) ?? null
		} catch (cause) {
			console.error('Could not load Stats:', cause)
			if (request === latestRequest) {
				events.value = []
				error.value = 'Could not load activity.'
			}
		} finally {
			if (request === latestRequest) loading.value = false
		}
	}

	const streakEvents = computed(() => events.value.filter((event) => event.event_type === 'streak_use'))
	const streakCounts = computed(() => countByDay(streakEvents.value, 'target_id'))
	const streakSeries = computed<StatsSeries[]>(() => streakEvents.value.length ? userIds.value.map((userId) => ({
		userId,
		values: days.value.map((day) => streakCounts.value.get(`${userId}:${day}`) ?? 0),
	})) : [])

	const creditSeries = computed<StatsSeries[]>(() => {
		const balances = new Map<string, number>()
		for (const event of events.value) {
			if (!event.created_at || event.balance === null) continue
			if (event.event_type !== 'credit_gain' && event.event_type !== 'credit_spent') continue
			balances.set(`${event.target_id}:${dayKey(event.created_at)}`, event.balance)
		}

		return userIds.value.map((userId) => {
			let lastBalance: number | null = null
			// Carry a known balance forward. Leave earlier days blank if there is no record.
			const values = days.value.map((day) => {
				lastBalance = balances.get(`${userId}:${day}`) ?? lastBalance
				return lastBalance
			})
			return { userId, values }
		}).filter(({ values }) => values.some((value) => value !== null))
	})

	const appOpenCounts = computed(() => countByDay(events.value.filter((event) =>
		event.event_type === 'app_open' && userIds.value.includes(event.actor_id)), 'actor_id'))
	const appOpensPerDay = computed(() => {
		const month = today.value.slice(0, 7)
		return days.value.filter((day) => day.startsWith(month)).flatMap((date) =>
			userIds.value.map((userId) => ({
				date,
				userId,
				count: appOpenCounts.value.get(`${userId}:${date}`) ?? 0,
			})),
		).filter(({ count }) => count > 0)
	})

	const todayStreaks = computed(() => streakCounts.value.get(`${user.value?.sub}:${today.value}`) ?? 0)
	const appOpensToday = computed(() => appOpenCounts.value.get(`${user.value?.sub}:${today.value}`) ?? 0)

	const monthPrefix = computed(() => today.value.slice(0, 7))
	const contractFreeDays = computed(() => {
		if (!lastContractUse.value) return null
		const lastDay = dayKey(lastContractUse.value)
		return (Date.parse(today.value) - Date.parse(lastDay)) / 86_400_000
	})

	const monthlyCredits = computed(() => {
		let gained = 0
		let spent = 0
		for (const event of events.value) {
			if (event.target_id !== user.value?.sub || !event.created_at || !dayKey(event.created_at).startsWith(monthPrefix.value)) continue
			if (event.event_type === 'credit_gain') gained += Math.abs(event.amount ?? 0)
			if (event.event_type === 'credit_spent') spent += Math.abs(event.amount ?? 0)
		}
		return { gained, spent }
	})

	const shopSummary = computed(() => {
		const thisMonth = purchases.value.filter((item) =>
			item.accepted_at && dayKey(item.accepted_at).startsWith(monthPrefix.value))
		const favorites = new Map<string, { title: string; count: number }>()
		let spent = 0

		for (const item of thisMonth) {
			const payer = item.kind === 'offer' ? item.partner_id : item.creator_id
			if (payer === user.value?.sub) spent += item.price

			const key = item.source_item_id ?? item.id
			const favorite = favorites.get(key)
			if (favorite) favorite.count++
			else favorites.set(key, { title: item.title, count: 1 })
		}

		return {
			bought: thisMonth.length,
			completed: thisMonth.filter(({ status }) => status === 'completed').length,
			owed: purchases.value.filter(({ status }) => status === 'accepted').length,
			spent,
			favorite: [...favorites.values()].sort((a, b) => b.count - a.count)[0] ?? null,
		}
	})

	watch(userIds, load, { immediate: true })

	return { days, loading, error, load, contractFreeDays, monthlyCredits, shopSummary, shopReady, rewardsReceived, todayStreaks, streakSeries, creditSeries, appOpensPerDay, appOpensToday }
}
