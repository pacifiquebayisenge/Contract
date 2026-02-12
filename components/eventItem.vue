<template>
	<div
		:id="props.item.id"
		ref="card"
		:style="{ borderRadius: '2rem !important', cursor: 'pointer' }"
		class="shadow-md my-3 event-item-container"
	>
		<div class="event-item-content mb-5">
			<!-- <div class="index" :class="insideBadgeRing ? 'inside-ring' : 'outside-ring'">
					<span class="text-2xl">{{ props.index + 1 }}</span>
				</div> -->

			<div v-if="props.item.event_type === 'app_open'" class="text truncate font-color">
				<span class="special">{{ props.item.target.firstname }}</span> opened the app 👀
			</div>

			<div v-if="props.item.event_type === 'credit_spent'" class="text truncate font-color">
				<span class="special">{{ props.item.target.firstname }}</span> lost some money 😫 !!
			</div>

			<div v-if="props.item.event_type === 'violation'" class="text truncate font-color">
				<span class="special">{{ props.item.target.firstname }}</span> made a violation 😡 !!
			</div>

			<div v-if="props.item.event_type === 'credit_gain'" class="text truncate font-color">
				<span class="special">{{ props.item.target.firstname }}</span> gained some money 💵 !!
			</div>

			<div v-if="props.item.event_type === 'streak_use'" class="text truncate font-color">
				<span class="special">{{ props.item.target.firstname }}</span> used contract again 🙄 !!
			</div>

			<!-- name: 'pending' | 'in-progress' | 'submitted' | 'in-review' | 'success' | 'failed' | 'expired' -->
			<!-- <StatusBadge version="Dot" :name="item.state" /> -->
		</div>

		<div class="footer">
			<div class="flex w-full justify-between flex gap-x-4 border-t border-gray-200 pt-2">
				<span>
					{{ formatTimeAgo(props.item.created_at) }} •
					{{ props.item.actor.firstname }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'
import { formatTimeAgo } from '~/utils/formatDate'

const props = defineProps({
	index: {
		type: Number,
		default: 0,
	},
	item: {
		type: Object,
		default: () => ({
			actor_id: undefined,
			amount: undefined,
			balance: undefined,
			created_at: undefined,
			event_type: undefined,
			id: undefined,
			target_id: undefined,
			actor: {},
			target: {},
		}),
	},
})

const themeStore = useThemeStore()

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor)
</script>

<style lang="scss" scoped>
.event-item-container {
	padding: 1.5rem 2rem !important;

	.event-item-content {
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-rows: auto;
		justify-content: center;
		align-items: center;
		gap: 2rem;

		.text {
			font-weight: 700;

			.special {
				color: v-bind(currentThemeColor);
			}
		}
	}

	.footer {
		span {
			font-weight: 600;
			color: #b5b5b5;
		}
	}
}
</style>
