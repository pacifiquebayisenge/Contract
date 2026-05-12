<template>
	<div
		:id="props.item.id"
		ref="card"
		:style="{ borderRadius: '2rem !important', cursor: 'pointer' }"
		class="shadow-md my-8 mx-[5px]"
		@click="showActions = !showActions"
	>
		<n-card :style="{ borderRadius: '2rem !important' }">
			<div class="contract-item flex gap-10 width-[100%]">
				<div class="index" :class="insideBadgeRing ? 'inside-ring' : 'outside-ring'">
					<span>{{ props.index + 1 }}</span>
				</div>

				<div class="contract-item-content min-w-0 flex-1">
					<p class="text font-color" :class="showActions ? 'line-clamp-2' : 'truncate'">
						{{ props.item.title }}
					</p>

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

					<div class="flex gap-x-4 border-t border-gray-200 mt-4 pt-1 footer">
						<div class="flex w-full justify-between">
							<span>
								{{ formatTimeAgo(props.item.created_at) }} •
								{{ userStore.getProfileById(props.item.author)?.firstname }}
							</span>

							<div class="flex justify-center items-center">
								<NIcon
									class="text-base opacity-55 font-bold"
									:size="15"
									:component="EllipsisVerticalIcon"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</n-card>

		<EditContractModal v-model:show="showEditDialog" :item="props.item" />

		<DeleteContractModal v-model:show="showDeleteDialog" :item="props.item" />
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { NIcon } from 'naive-ui'
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
const currentLightThemeColor = computed(() => themeStore.extraLightThemeColor)
const insideBadgeRing = computed(() => themeStore.isInsideBadgeRing)
</script>

<style lang="scss" scoped>
.contract-item {
	display: grid;
	grid-template-columns: auto 1fr auto;
	grid-template-rows: auto;
	justify-content: center;

	.index {
		width: 3.5rem;
		height: 3.5rem;

		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: 1rem;

		font-weight: 700;
		color: v-bind(currentThemeColor);

		background: linear-gradient(
			145deg,
			v-bind(currentLightThemeColor),
			v-bind(currentLightThemeColor)
		);

		// box-shadow:
		// 	0 0.8rem 1.8rem rgba(0, 0, 0, 0.12),
		// 	inset 0 0.1rem 0.4rem rgba(255, 255, 255, 0.9);

		// border: 0.2rem solid rgba(255, 255, 255, 0.9);

		span {
			font-size: 1.75rem;
			line-height: 1;
		}

		&.outside-ring {
			outline: 0.2rem solid rgba(0, 0, 0, 0.08);
			outline-offset: 0.3rem;
		}

		&.inside-ring {
			outline: 0.2rem solid rgba(0, 0, 0, 0.08);
			outline-offset: -0.5rem;
		}
	}

	.text {
		font-weight: 700;
		font-size: 1.6rem;
	}

	.contract-item-content {
		min-width: 0;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;

		line-height: 1.4;
		max-height: calc(1.4em * 2);
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
