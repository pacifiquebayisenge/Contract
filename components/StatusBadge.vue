<template>
	<div
		v-if="version === 'Badge'"
		:class="['status-badge', badgeConfig.class]"
		@click="emit('click', props.name)"
	>
		<NIcon :size="15" :component="badgeConfig.icon" />
		<span>{{ badgeConfig.label }}</span>
	</div>

	<div else :class="['status-dot', badgeConfig.class]"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
	ArrowPathIcon,
	ArrowPathRoundedSquareIcon,
	CheckCircleIcon,
	ClockIcon,
	ExclamationTriangleIcon,
	PaperAirplaneIcon,
	XCircleIcon,
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
	name: 'Pending' | 'Progress' | 'Submitted' | 'Review' | 'Success' | 'Failed' | 'Expired'
	version: 'Badge' | 'Dot'
}>()

// Badge configurations
const badges = {
	Pending: {
		label: 'Pending',
		class: 'pending-state',
		icon: ExclamationTriangleIcon,
	},
	Progress: {
		label: 'In progress',
		class: 'progress-state',
		icon: ArrowPathIcon,
	},
	Submitted: {
		label: 'Submitted',
		class: 'submitted-state',
		icon: PaperAirplaneIcon,
	},
	Review: {
		label: 'In review',
		class: 'review-state',
		icon: ArrowPathRoundedSquareIcon,
	},
	Success: {
		label: 'Success',
		class: 'success-state',
		icon: CheckCircleIcon,
	},
	Failed: {
		label: 'Failed',
		class: 'failed-state',
		icon: XCircleIcon,
	},
	Expired: {
		label: 'Expired',
		class: 'expired-state',
		icon: ClockIcon,
	},
}

const badgeConfig = computed(() => badges[props.name])

const emit = defineEmits<{
	(e: 'click', value: string): void
}>()
</script>

<style scoped>
.status-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 8px 16px;
	border-radius: 10px;
	font-size: 12px;
	font-weight: 500;
	text-wrap-mode: nowrap;
	box-shadow: 4px 3px 4px rgba(87, 87, 87, 0.2);
}

.status-dot {
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
}

/* Pending - Orange/Amber */
.pending-state {
	background-color: rgba(245, 158, 11, 0.15);
	color: #f59e0b;
}

/* In Progress - Blue */
.progress-state {
	background-color: rgba(59, 130, 246, 0.15);
	color: #3b82f6;
}

/* Submitted - Purple */
.submitted-state {
	background-color: rgba(139, 92, 246, 0.2);
	color: #a78bfa;
}

/* In Review - Yellow/Olive */
.review-state {
	background-color: rgba(202, 138, 4, 0.2);
	color: #eab308;
}

/* Success - Green */
.success-state {
	background-color: rgba(34, 197, 94, 0.15);
	color: #22c55e;
}

/* Failed - Red */
.failed-state {
	background-color: rgba(239, 68, 68, 0.15);
	color: #ef4444;
}

/* Expired - Gray */
.expired-state {
	background-color: rgba(156, 163, 175, 0.15);
	color: #9ca3af;
}
</style>
