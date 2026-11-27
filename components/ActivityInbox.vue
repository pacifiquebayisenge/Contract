<template>
	<section class="violation-inbox" aria-label="Inbox activity">
		<p v-if="loading" role="status">Loading activity…</p>
		<div v-else-if="errorMessage" role="alert">
			<p>{{ errorMessage }}</p>
			<n-button text @click="$emit('retry')">Try again</n-button>
		</div>
		<template v-else>
			<p v-if="focusedId && !focusedActivity">This activity is no longer available.</p>
			<p v-if="!activities.length">No activity yet.</p>
			<ol v-else class="activity-list">
				<li
					v-for="item in activities"
					:key="`${item.kind}-${item.id}`"
					class="activity-item"
					:class="{ 'activity-item-highlighted': isFocused(item), 'activity-item-unread': isUnread(item) }"
				>
					<div class="activity-heading">
						<button v-if="isUnread(item)" type="button" class="activity-read" @click="$emit('read', item)">
							<span class="activity-dot" aria-hidden="true"></span>
							<strong>{{ item.title }}</strong>
							<span class="sr-only">Mark as read</span>
						</button>
						<strong v-else>{{ item.title }}</strong>
						<span
							v-if="item.amount !== null"
							class="activity-cost"
							:class="{
								'activity-reward': item.kind === 'reward',
								'activity-contract': item.kind === 'contract',
							}"
						>
							{{ item.kind === 'reward' ? `+${item.amount}` : item.amount }}
						</span>
					</div>
					<p v-if="item.targetId">Used by {{ userStore.getFullNameById(item.targetId) }}</p>
					<p>{{ item.kind === 'reward' ? 'Given by' : item.kind === 'shop-publication' ? 'Published by' : item.kind === 'shop' ? 'Purchased by' : 'Reported by' }}
						{{ userStore.getFullNameById(item.actorId) }}</p>
					<time v-if="item.createdAt" :datetime="item.createdAt">
						{{ formatDateTime(item.createdAt) }}
					</time>
				</li>
			</ol>
		</template>
	</section>
</template>

<script setup lang="ts">
import type { Activity } from '~/composables/useActivityInbox'
import { formatDateTime } from '~/utils/formatDate'

defineProps<{
	focusedId: string | null
	focusedActivity?: Activity
	activities: Activity[]
	loading: boolean
	errorMessage: string
	isFocused: (item: Activity) => boolean
	isUnread: (item: Activity) => boolean
}>()
defineEmits<{ read: [item: Activity]; retry: [] }>()

const userStore = useUserStore()
</script>

<style scoped>
.violation-inbox {
	padding: 1rem 1.25rem 2rem;
}

.activity-list {
	display: grid;
	gap: 0.75rem;
}

.activity-item {
	padding: 1rem;
	border: 1px solid #ddd;
	border-radius: 1rem;
	background: #fff;
	color: #525252;
}

.activity-item-highlighted {
	border-color: var(--theme-color);
	outline: 1px solid var(--theme-color);
}

.activity-heading {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	gap: 0.25rem 0.75rem;
	margin-bottom: 0.35rem;
	color: #262626;
	overflow-wrap: anywhere;
}

.activity-cost {
	color: #ee0b38;
	font-weight: 600;
}
.activity-reward {
	color: #55af7a;
}
.activity-contract {
	color: #cc5200;
}

.activity-item-unread { background: #f5f1fc; }
.activity-read { display: inline-flex; align-items: baseline; gap: 0.5rem; text-align: left; }
.activity-dot { width: 0.5rem; height: 0.5rem; flex: none; border-radius: 50%; background: #7956b3; }
</style>
