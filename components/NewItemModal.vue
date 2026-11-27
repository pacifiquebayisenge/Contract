<template>
	<n-modal
		:show="props.show"
		transform-origin="center"
		@update:show="emit('update:show', $event)"
	>
		<section class="creation-menu" role="dialog" aria-modal="true" aria-labelledby="creation-menu-title">
			<header class="creation-header">
				<h2 id="creation-menu-title">Something new</h2>
				<button class="creation-close" type="button" aria-label="Close" @click="close">
					<XMarkIcon aria-hidden="true" />
				</button>
			</header>

			<div class="creation-options">
				<button class="creation-action contract" type="button" @click="openContract">
					<span class="creation-icon"><DocumentIcon aria-hidden="true" /></span>
					<span>Contract</span>
				</button>
				<button class="creation-action shop" type="button" :disabled="!userStore.partnerProfile" @click="openShopItem">
					<span class="creation-icon"><BuildingStorefrontIcon aria-hidden="true" /></span>
					<span>New item</span>
				</button>
				<button class="creation-action restic" type="button" @click="close">
					<span class="creation-icon"><SparklesIcon aria-hidden="true" /></span>
					<span>Restić</span>
				</button>
				<button class="creation-action gift" type="button" @click="close">
					<span class="creation-icon"><GiftIcon aria-hidden="true" /></span>
					<span>Gift</span>
				</button>
			</div>
		</section>
	</n-modal>

	<ShopItemModal v-model:show="showShopItem" />
	<NewContractModal v-model:show="showNewContractModal" :fullname="userStore.getFullname" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
	BuildingStorefrontIcon,
	DocumentIcon,
	GiftIcon,
	SparklesIcon,
	XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useUserStore } from '~/stores/user'

const props = defineProps({
	show: {
		type: Boolean,
		required: true,
	},
})

const emit = defineEmits(['update:show'])

const userStore = useUserStore()

const showNewContractModal = ref(false)
const showShopItem = ref(false)

function openShopItem() {
	emit('update:show', false)
	showShopItem.value = true
}

function openContract() {
	close()
	showNewContractModal.value = true
}

function close() {
	emit('update:show', false)
}
</script>

<style scoped>
.creation-menu {
	width: min(29rem, calc(100% - 2.5rem));
	max-height: calc(100dvh - 2.5rem);
	overflow-y: auto;
	padding: clamp(1rem, 4vw, 1.65rem);
	border: 1px solid #fff;
	border-radius: 1.75rem;
	background: linear-gradient(155deg, #fff 35%, #f5f2fa);
	box-shadow: 0 1.4rem 3.5rem #24213f29;
}

.creation-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 1.15rem;
}

.creation-header h2 {
	margin: 0;
	color: #47424f;
	font-size: 1.5rem;
	font-weight: 800;
}

.creation-close {
	display: grid;
	flex: none;
	width: 2.5rem;
	height: 2.5rem;
	place-items: center;
	border-radius: 50%;
	background: #f1eef5;
	color: #65606e;
}

.creation-close svg { width: 1.2rem; }

.creation-options {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
}

.creation-action {
	display: grid;
	justify-items: start;
	align-content: space-between;
	gap: 0.65rem;
	min-height: 6rem;
	padding: 0.8rem;
	border: 1px solid var(--action-edge);
	border-bottom-width: 4px;
	border-radius: 1.1rem;
	background: var(--action-fill);
	color: var(--action-ink);
	font-size: 1.05rem;
	font-weight: 750;
	text-align: start;
	transition: transform 150ms ease, filter 150ms ease;
}

.creation-action:hover:not(:disabled) { filter: brightness(0.98); }
.creation-action:active:not(:disabled) { transform: translateY(2px); }
.creation-action:disabled { opacity: 0.5; cursor: not-allowed; }
.creation-action:focus-visible, .creation-close:focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 3px;
}

.creation-icon {
	display: grid;
	width: 2.4rem;
	height: 2.4rem;
	place-items: center;
	border-radius: 0.72rem;
	background: #ffffffb3;
}

.creation-icon svg { width: 1.35rem; }

.contract { --action-fill: #e8f2fd; --action-edge: #c0d7ef; --action-ink: #245d90; }
.shop { --action-fill: #f1e9fc; --action-edge: #d8c5ee; --action-ink: #684293; }
.restic { --action-fill: #fff1d7; --action-edge: #eed3a0; --action-ink: #8a5518; }
.gift { --action-fill: #fce9ef; --action-edge: #edc2d2; --action-ink: #9d3b60; }

@media (prefers-reduced-motion: reduce) {
	.creation-action { transition: none; }
}
</style>
