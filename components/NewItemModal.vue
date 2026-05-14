<template>
	<n-modal
		:show="props.show"
		:auto-focus="false"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<div class="new-item-modal w-[90%] max-w-[42rem]">
			<n-card
				class="modal-border gradient-background"
				:style="{
					'--theme-color': currentLightThemeColor,
				}"
				:bordered="false"
				size="huge"
				role="dialog"
			>
				<template #header>
					<div class="modal-header mb-5">
						<span class="font-color">Something new</span>
					</div>
				</template>

				<div class="new-options">
					<button
						class="new-option"
						type="button"
						@click="showNewContractModal = !showNewContractModal"
					>
						<div class="icon-box blue shadow-md">
							<NIcon class="base-icon" :size="30" :component="DocumentIcon" />
						</div>

						<div class="option-text">
							<p class="option-title">Contract</p>
						</div>
					</button>

					<button class="new-option" type="button" @click="submit">
						<div class="icon-box purple shadow-md">
							<NIcon class="base-icon" :size="30" :component="BuildingStorefrontIcon" />
						</div>

						<div class="option-text">
							<p class="option-title">Item</p>
						</div>
					</button>

					<button class="new-option" type="button" @click="submit">
						<div class="icon-box amber shadow-md">
							<NIcon class="base-icon" :size="30" :component="SparklesIcon" />
						</div>

						<div class="option-text">
							<p class="option-title">Restić</p>
						</div>
					</button>

					<button class="new-option" type="button" @click="submit">
						<div class="icon-box rose shadow-md">
							<NIcon class="base-icon" :size="30" :component="GiftIcon" />
						</div>

						<div class="option-text">
							<p class="option-title">Gift</p>
						</div>
					</button>
				</div>
			</n-card>
		</div>
	</n-modal>

	<NewContractModal v-model:show="showNewContractModal" :fullname="userStore.getFullname" />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {
	BuildingStorefrontIcon,
	DocumentIcon,
	GiftIcon,
	SparklesIcon,
} from '@heroicons/vue/24/outline'
import { useContractStore } from '~/stores/contract'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

const props = defineProps({
	show: {
		type: Boolean,
		required: true,
	},
})

const emit = defineEmits(['update:show'])

const themeStore = useThemeStore()
const userStore = useUserStore()

const currentLightThemeColor = computed(() => themeStore.lightThemeColor)

let showNewContractModal = ref(false)

const submit = async () => {
	emit('update:show', false)
}
</script>

<style lang="scss" scoped>
.new-item-modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 2rem;
}

:deep(.modal-border) {
	border-radius: 2rem !important;

	box-shadow:
		0 1.5rem 4rem rgba(0, 0, 0, 0.08),
		inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

:deep(.n-card-header) {
	padding-bottom: 0;
}

.modal-header {
	display: flex;
	justify-content: center;
	align-items: center;
}

.font-color {
	font-size: 1.6rem;
	font-weight: 700;
}

.new-options {
	display: flex;
	gap: 2rem;
	padding: 1rem 0;
	flex-wrap: wrap;
	justify-content: center;
}

.new-option {
	width: 8rem;
	display: flex;
	align-items: center;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
	border: none;
	border-radius: 2rem;
	background: transparent;

	cursor: pointer;
	transition:
		background 0.2s ease,
		transform 0.2s ease;

	&:hover {
		transform: translateY(-1px);
	}
}

.icon-box {
	width: 5.8rem;
	height: 5.8rem;
	border-radius: 1.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;

	position: relative;

	// BLUE
	&.blue {
		background: #eaf3ff;
		color: #2588d8;
	}

	// RED
	&.red {
		background: #ffecef;
		color: #df4052;
	}

	// YELLOW
	&.yellow {
		background: #fff3dc;
		color: #e7a11d;
	}

	// GREEN
	&.green {
		background: #e5f7f1;
		color: #28b988;
	}

	// PURPLE
	&.purple {
		background: #f3ecff;
		color: #8b5cf6;
	}

	// PINK
	&.pink {
		background: #ffeaf4;
		color: #ec4899;
	}

	// ORANGE
	&.orange {
		background: #fff1e6;
		color: #f97316;
	}

	// CYAN
	&.cyan {
		background: #e6fbff;
		color: #06b6d4;
	}

	// TEAL
	&.teal {
		background: #e6fffa;
		color: #14b8a6;
	}

	// INDIGO
	&.indigo {
		background: #eef2ff;
		color: #6366f1;
	}

	// LIME
	&.lime {
		background: #f7ffe5;
		color: #84cc16;
	}

	// AMBER
	&.amber {
		background: #fff8e6;
		color: #f59e0b;
	}

	// SKY
	&.sky {
		background: #eaf7ff;
		color: #0ea5e9;
	}

	// EMERALD
	&.emerald {
		background: #e9fff5;
		color: #10b981;
	}

	// ROSE
	&.rose {
		background: #fff1f4;
		color: #f43f5e;
	}

	// VIOLET
	&.violet {
		background: #f5f0ff;
		color: #7c3aed;
	}

	// SLATE
	&.slate {
		background: #f1f5f9;
		color: #475569;
	}

	// NEUTRAL
	&.neutral {
		background: #f5f5f5;
		color: #525252;
	}

	// DARK
	&.dark {
		background: rgba(0, 0, 0, 0.08);
		color: rgba(0, 0, 0, 0.75);
	}

	// THEME BASED
	&.theme {
		background: color-mix(in srgb, var(--theme-color) 14%, white);
		color: var(--theme-color);
	}
	// Coral
	&.coral {
		background: rgba(255, 120, 90, 0.15);
		color: #ff785a;
	}

	// Peach
	&.peach {
		background: rgba(255, 180, 120, 0.16);
		color: #fb923c;
	}

	// Lavender
	&.lavender {
		background: rgba(180, 140, 255, 0.16);
		color: #a855f7;
	}

	// Ice
	&.ice {
		background: rgba(180, 230, 255, 0.18);
		color: #38bdf8;
	}

	// Ocean
	&.ocean {
		background: rgba(0, 119, 255, 0.14);
		color: #2563eb;
	}

	// Forest
	&.forest {
		background: rgba(34, 120, 87, 0.16);
		color: #15803d;
	}

	// Wine
	&.wine {
		background: rgba(140, 30, 60, 0.14);
		color: #be123c;
	}

	// Mocha
	&.mocha {
		background: rgba(120, 90, 60, 0.14);
		color: #8b5e3c;
	}

	// Sand
	&.sand {
		background: rgba(230, 200, 140, 0.18);
		color: #c28b2c;
	}

	// Graphite
	&.graphite {
		background: rgba(55, 65, 81, 0.12);
		color: #374151;
	}

	// Steel
	&.steel {
		background: rgba(100, 116, 139, 0.14);
		color: #64748b;
	}

	// Midnight
	&.midnight {
		background: rgba(15, 23, 42, 0.12);
		color: #0f172a;
	}

	// Neon Green
	&.neon-green {
		background: rgba(132, 255, 0, 0.14);
		color: #65a30d;
	}

	// Electric Purple
	&.electric-purple {
		background: rgba(168, 85, 247, 0.16);
		color: #9333ea;
	}

	// Bubblegum
	&.bubblegum {
		background: rgba(255, 105, 180, 0.15);
		color: #ec4899;
	}

	// Arctic
	&.arctic {
		background: rgba(240, 249, 255, 0.9);
		color: #0284c7;
	}

	// Frost
	&.frost {
		background: rgba(255, 255, 255, 0.45);
		color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(10px);
	}

	// Gold
	&.gold {
		background: rgba(255, 215, 0, 0.15);
		color: #d4a017;
	}

	// Silver
	&.silver {
		background: rgba(226, 232, 240, 0.7);
		color: #64748b;
	}

	// Bronze
	&.bronze {
		background: rgba(205, 127, 50, 0.16);
		color: #b45309;
	}
}

.option-title {
	margin: 0;
	font-size: 1.35rem;
	font-weight: 700;
	color: #676666;
}

.gradient-background {
	background: linear-gradient(
		to bottom,
		#f9f9fb 0%,
		#f9f9fb 5%,
		color-mix(in srgb, var(--theme-color) 15%, #f9f9fb) 60%,
		color-mix(in srgb, var(--theme-color) 30%, #f9f9fb) 100%
	);

	background-attachment: fixed;
}

.gradient::before {
	content: '';
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 0;

	background: linear-gradient(
		135deg,
		transparent 0%,
		transparent 50%,
		color-mix(in srgb, var(--theme-color) 3%, transparent) 100%
	);

	opacity: 0.25;
}
</style>
