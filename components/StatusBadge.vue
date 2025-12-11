<template>
	<span :class="['status-badge', badgeConfig.class]">
		<NIcon :size="20" :component="badgeConfig.icon" />
		<span>{{ badgeConfig.label }}</span>
	</span>
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
	name: 'pending' | 'in-progress' | 'submitted' | 'in-review' | 'success' | 'failed' | 'expired'
}>()

// Badge configurations
const badges = {
	pending: {
		label: 'Pending',
		class: 'badge-pending',
		icon: ExclamationTriangleIcon,
	},
	'in-progress': {
		label: 'In progress',
		class: 'badge-in-progress',
		icon: ArrowPathIcon,
	},
	submitted: {
		label: 'Submitted',
		class: 'badge-submitted',
		icon: PaperAirplaneIcon,
	},
	'in-review': {
		label: 'In review',
		class: 'badge-in-review',
		icon: ArrowPathRoundedSquareIcon,
	},
	success: {
		label: 'Success',
		class: 'badge-success',
		icon: CheckCircleIcon,
	},
	failed: {
		label: 'Failed',
		class: 'badge-failed',
		icon: XCircleIcon,
	},
	expired: {
		label: 'Expired',
		class: 'badge-expired',
		icon: ClockIcon,
	},
}

const badgeConfig = computed(() => badges[props.name])
</script>

<style scoped>
.status-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 8px 16px;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 500;
	text-wrap-mode: nowrap;
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
