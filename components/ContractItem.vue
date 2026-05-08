<template>
	<div
		:id="props.item.id"
		ref="card"
		:style="{ borderRadius: '2rem !important', cursor: 'pointer' }"
		class="shadow-md my-8"
	>
		<n-card :style="{ borderRadius: '2rem !important' }">
			<div class="contract-item-content" @click="showActions = !showActions">
				<div class="index" :class="insideBadgeRing ? 'inside-ring' : 'outside-ring'">
					<span class="text-2xl">{{ props.index + 1 }}</span>
				</div>

				<div class="text truncate font-color">{{ props.item.title }}</div>

				<!-- name: 'pending' | 'in-progress' | 'submitted' | 'in-review' | 'success' | 'failed' | 'expired' -->
				<!-- <StatusBadge version="Dot" :name="item.state" /> -->
			</div>

			<n-collapse-transition :show="showActions">
				<div class="contract-item-content-actions mt-5">
					<div class="content">
						<textarea
							readonly
							class="contract-description w-[100%] h-[15rem] bg-[#0000000a] py-4 px-6 rounded-[1rem] font-color"
							:name="'contract-rule-description-' + props.index"
							:value="props.item.description"
						/>

						<div class="action-buttons py-8">
							<button
								class="button-3D button-3D-colorful"
								@click="showEditDialog = !showEditDialog"
							>
								<NIcon class="text-base opacity-55" :size="20" :component="PencilSquareIcon" />
							</button>

							<button
								class="button-3D button-3D-colorful-error"
								@click="showDeleteDialog = !showDeleteDialog"
							>
								<NIcon class="text-base opacity-55" :size="20" :component="TrashIcon" />
							</button>
						</div>
					</div>
				</div>
			</n-collapse-transition>

			<template #footer>
				<div class="flex gap-x-4 border-t border-gray-200 pt-2 footer">
					<div class="flex w-full justify-between">
						<span>
							{{ formatTimeAgo(props.item.created_at) }} •
							{{ userStore.getProfileById(props.item.author)?.firstname }}
						</span>

						<StatusBadge version="Dot" :name="item.state" />
					</div>
				</div>
			</template>
		</n-card>

		<EditContractModal v-model:show="showEditDialog" :item="props.item" />

		<DeleteContractModal v-model:show="showDeleteDialog" :item="props.item" />
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'
import { formatTimeAgo } from '~/utils/formatDate'

const props = defineProps({
	index: {
		type: Number,
		default: 0,
	},
	item: {
		type: Object,
		default: () => ({
			id: undefined,
			title: undefined,
			description: undefined,
			author: undefined,
			state: undefined,
			created_at: undefined,
		}),
	},
})

const themeStore = useThemeStore()
const userStore = useUserStore()

let showActions = ref(false)
let showEditDialog = ref(false)
let showDeleteDialog = ref(false)

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.selectedLightThemeColor)
const insideBadgeRing = computed(() => themeStore.isInsideBadgeRing)
</script>

<style lang="scss" scoped>
.contract-item-content {
	display: grid;
	grid-template-columns: auto 1fr auto;
	grid-template-rows: auto;
	justify-content: center;
	align-items: center;
	gap: 2rem;

	.index {
		font-weight: 600;
		color: v-bind(currentThemeColor);

		background: v-bind(currentLightThemeColor);
		display: flex;
		justify-content: center;
		align-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 1rem;
		border-start-end-radius: inherit;

		&.outside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
			outline-offset: 3px;
		}

		&.inside-ring {
			outline: 2px solid rgba(0, 0, 0, 0.1);
			outline-offset: -5px;
		}
	}

	.text {
		font-weight: 600;
		font-size: 1.6rem;
	}
}

.contract-item-content-actions {
	display: flex;
	align-content: center;
	gap: 2rem;
	width: 100%;
	justify-content: center;

	span {
		padding-top: 0.25rem;
		font-weight: 500;
	}

	.content {
		margin-top: 1rem;

		.contract-description {
			resize: none;

			&:focus {
				outline: 2px solid v-bind(currentLightThemeColor);
				border-color: v-bind(currentLightThemeColor);
			}
		}

		width: 100%;
		max-width: 50rem;

		.action-buttons {
			display: flex;
			align-items: center;
			gap: 5rem;
			width: 100%;

			button {
				width: 70%;
			}
		}
	}
}

.footer div {
	span {
		font-weight: 600;
		color: #b5b5b5;
	}
}

.state-indicator {
	width: 1rem;
	height: 1rem;
	border-radius: 50%;
	background-color: rgba(245, 158, 11, 0.15);
}

/* Pending - Orange/Amber */
.badge-pending {
	background-color: rgba(245, 158, 11, 0.15);
	color: #f59e0b;
}

/* In Progress - Blue */
.badge-in-progress {
	background-color: rgba(59, 130, 246, 0.15);
	color: #3b82f6;
}

/* Submitted - Purple */
.badge-submitted {
	background-color: rgba(139, 92, 246, 0.2);
	color: #a78bfa;
}

/* In Review - Yellow/Olive */
.badge-in-review {
	background-color: rgba(202, 138, 4, 0.2);
	color: #eab308;
}

/* Success - Green */
.badge-success {
	background-color: rgba(34, 197, 94, 0.15);
	color: #22c55e;
}

/* Failed - Red */
.badge-failed {
	background-color: rgba(239, 68, 68, 0.15);
	color: #ef4444;
}

/* Expired - Gray */
.badge-expired {
	background-color: rgba(156, 163, 175, 0.15);
	color: #9ca3af;
}
</style>
