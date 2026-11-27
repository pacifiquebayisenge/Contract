import type { Ref } from 'vue'
import type { Database } from '~/types/supabase.types'

type Violation = Database['public']['Tables']['user_events']['Row']
type Reward = Database['public']['Tables']['credit_increases']['Row']
type ShopItem = Database['public']['Tables']['shop_items']['Row']
export type Activity = {
	id: string
	kind: 'violation' | 'reward' | 'contract' | 'shop' | 'shop-publication'
	title: string
	amount: number | null
	actorId: string
	targetId?: string
	createdAt: string | null
}

export function useActivityInbox(
	focusedId: Ref<string | null>,
	focusedKind: Ref<Exclude<Activity['kind'], 'shop' | 'shop-publication'>>,
	open: Ref<boolean>,
) {
	const supabase = useSupabaseClient<Database>()
	const user = useSupabaseUser()
	const activities = ref<Activity[]>([])
	const loading = ref(false)
	const errorMessage = ref('')
	const focusedActivity = computed(() => activities.value.find(isFocused))
	let latestRequest = 0

	function violationCreditAmount(amount: number | null) {
		if (amount !== null && amount < 0) return amount

		// Older events stored the count. Apply the standard 100-credit penalty per violation.
		return -100 * (amount !== null && amount > 0 ? amount : 1)
	}

	function eventQuery(userId: string, kind: 'violation' | 'streak_use') {
		return supabase
			.from('user_events')
			.select('*')
			.eq('event_type', kind)
			.or(`actor_id.eq.${userId},target_id.eq.${userId}`)
	}

	function rewardQuery(userId: string) {
		return supabase
			.from('credit_increases')
			.select('*')
			.or(`giver_id.eq.${userId},receiver_id.eq.${userId}`)
	}

	function violationActivity(row: Violation): Activity {
		return {
			id: row.id,
			kind: 'violation',
			title: row.rule_title || 'Contract violation',
			amount: violationCreditAmount(row.amount),
			actorId: row.actor_id,
			createdAt: row.created_at,
		}
	}

	function rewardActivity(row: Reward): Activity {
		return {
			id: row.id,
			kind: 'reward',
			title: row.description || 'Reward',
			amount: row.amount,
			actorId: row.giver_id,
			createdAt: row.created_at,
		}
	}

	function contractActivity(row: Violation): Activity {
		const number = row.contract_use_number
		const cost = row.contract_credit_cost
		const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels' })
		const today = row.created_at && formatter.format(new Date(row.created_at)) === formatter.format(new Date())

		return {
			id: row.id,
			kind: 'contract',
			title: number ? `Contract #${number}${today ? ' today' : ''}` : 'Contract used',
			amount: cost && cost > 0 ? -cost : null,
			actorId: row.actor_id,
			targetId: row.target_id,
			createdAt: row.created_at,
		}
	}

	function shopActivity(item: ShopItem, userId: string): Activity {
		const payerId = item.kind === 'offer' ? item.partner_id : item.creator_id
		return {
			id: item.id,
			kind: 'shop',
			title: `Shop purchase · ${item.title}`,
			amount: payerId === userId ? -item.price : null,
			actorId: payerId,
			createdAt: item.accepted_at,
		}
	}

	function shopPublication(item: ShopItem): Activity {
		return {
			id: item.id,
			kind: 'shop-publication',
			title: `New Shop item · ${item.title}`,
			amount: null,
			actorId: item.creator_id,
			createdAt: item.created_at,
		}
	}

	function isFocused(item: Activity) {
		return item.id === focusedId.value && item.kind === focusedKind.value
	}

	async function loadActivity(background = false) {
		const userId = user.value?.sub
		if (!userId) return

		const request = ++latestRequest
		const id = focusedId.value
		const kind = focusedKind.value
		if (!background) {
			loading.value = true
			errorMessage.value = ''
		}

		try {
			const [violations, rewards, contracts, purchases, publications] = await Promise.all([
				eventQuery(userId, 'violation').order('created_at', { ascending: false, nullsFirst: false }).limit(25),
				rewardQuery(userId).order('created_at', { ascending: false }).limit(25),
				eventQuery(userId, 'streak_use').order('created_at', { ascending: false, nullsFirst: false }).limit(25),
				supabase.from('shop_items').select('*').not('accepted_at', 'is', null)
					.order('accepted_at', { ascending: false }).limit(25),
				supabase.from('shop_items').select('*').is('source_item_id', null).order('created_at', { ascending: false }).limit(25),
			])
			if (violations.error) throw violations.error
			if (rewards.error) throw rewards.error
			if (contracts.error) throw contracts.error
			if (purchases.error) throw purchases.error
			if (publications.error) throw publications.error

			const recent = [
				...(violations.data ?? []).map(violationActivity),
				...(rewards.data ?? []).map(rewardActivity),
				...(contracts.data ?? []).map(contractActivity),
				...(purchases.data ?? []).map((item) => shopActivity(item, userId)),
				...(publications.data ?? []).map(shopPublication),
			].sort((a, b) => {
				const timestamp = (value: string | null) => value ? Date.parse(value) : 0
				return timestamp(b.createdAt) - timestamp(a.createdAt)
			}).slice(0, 25)

			let focused = recent.find(isFocused)
			// Older notifications can point outside the current page of activity.
			if (id && !focused) {
				if (kind === 'reward') {
					const { data, error } = await rewardQuery(userId).eq('id', id).maybeSingle()
					if (error) throw error
					if (data) focused = rewardActivity(data)
				} else {
					const eventType = kind === 'contract' ? 'streak_use' : 'violation'
					const { data, error } = await eventQuery(userId, eventType).eq('id', id).maybeSingle()
					if (error) throw error
					if (data) focused = kind === 'contract' ? contractActivity(data) : violationActivity(data)
				}
			}

			if (request === latestRequest) {
				errorMessage.value = ''
				if (focused && open.value) markRead(focused)
				activities.value = focused ? [focused, ...recent.filter((item) => !isFocused(item))] : recent
			}
		} catch (error) {
			console.error('Failed to load inbox activity:', error)
			if (!background && request === latestRequest) errorMessage.value = 'Could not load activity.'
		} finally {
			if (request === latestRequest) loading.value = false
		}
	}


	const userId = computed(() => user.value?.sub)
	const storageKey = computed(() => `ugovor.inbox.read.${userId.value}`)
	const readKeys = ref(new Set<string>())

	function restoreReadKeys() {
		try {
			const keys: unknown = JSON.parse(localStorage.getItem(storageKey.value) ?? '[]')
			readKeys.value = new Set(Array.isArray(keys) ? keys.filter((key): key is string => typeof key === 'string') : [])
		} catch {
			readKeys.value = new Set()
		}
	}

	function activityKey(item: Activity) {
		return `${item.kind}:${item.id}`
	}

	function isUnread(item: Activity) {
		return !!userId.value && item.actorId !== userId.value && !readKeys.value.has(activityKey(item))
	}

	function markRead(item: Activity) {
		if (!isUnread(item)) return
		readKeys.value.add(activityKey(item))
		try {
			localStorage.setItem(storageKey.value, JSON.stringify([...readKeys.value]))
		} catch {
			// Keep the read state for this session if storage is unavailable.
		}
	}

	const hasUnread = computed(() => activities.value.some(isUnread))
	const refreshVisible = () => {
		if (!document.hidden && !loading.value) void loadActivity(true)
	}
	const syncReadKeys = (event: StorageEvent) => {
		if (event.key === storageKey.value) restoreReadKeys()
	}

	onMounted(() => {
		watch(userId, () => {
			latestRequest++
			activities.value = []
			loading.value = false
			restoreReadKeys()
			void loadActivity()
		}, { immediate: true })
		watch([open, focusedId, focusedKind], ([show]) => {
			if (show) void loadActivity()
		})
		const timer = window.setInterval(refreshVisible, 60_000)
		document.addEventListener('visibilitychange', refreshVisible)
		window.addEventListener('storage', syncReadKeys)
		onBeforeUnmount(() => {
			latestRequest++
			window.clearInterval(timer)
			document.removeEventListener('visibilitychange', refreshVisible)
			window.removeEventListener('storage', syncReadKeys)
		})
	})

	return { activities, loading, errorMessage, focusedActivity, hasUnread, isUnread, isFocused, markRead, loadActivity }
}
