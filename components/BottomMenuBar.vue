<template>
	<div>
		<div class="bottom-menu-bar">
			<div class="items flex space-between justify-center">
				<div class="item" @click="activateAccountDrawer()">
					<div class="icon">
						<NIcon class="text-base opacity-55" :size="30" :component="UserIcon" />
					</div>
				</div>
				<div class="item">
					<div class="icon">
						<NIcon class="text-base opacity-55" :size="30" :component="WalletIcon" />
					</div>
				</div>
				<div class="item" @click="activateInboxDrawer()">
					<div class="icon">
						<NIcon class="text-base opacity-55" :size="30" :component="InboxIcon" />
					</div>
				</div>
				<div class="item" @click="showNewItemModal = !showNewItemModal">
					<div class="icon">
						<NIcon class="text-base opacity-55" :size="30" :component="Squares2X2Icon" />
					</div>
				</div>
			</div>
		</div>

		<!-- account drawer -->
		<n-drawer
			v-model:show="showAccount"
			height="min(650px, 90dvh)"
			placement="bottom"
			:auto-focus="false"
			:block-scroll="true"
			:trap-focus="false"
			style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
		>
			<n-drawer-content
				:native-scrollbar="false"
				class="drawer-gradient-background"
				:style="{
					'--theme-color': currentLightThemeColor,
					'border-top-left-radius': '2rem',
					'border-top-right-radius': '2rem',
				}"
			>
				<template #header>
					<div class="modal-header">
						<span class="font-color" :style="{ fontWeight: '700' }">Account</span>
					</div>
				</template>

				<div class="account-settings">
					<n-collapse arrow-placement="right" :default-expanded-names="['profile']">
						<n-collapse-item name="profile">
							<template #header>
								<span class="settings-heading"><UserIcon aria-hidden="true" /> Profile</span>
							</template>
							<form class="settings-panel profile-fields" @submit.prevent="saveChanges">
								<label>First name <n-input v-model:value="inputValue.firstname" /></label>
								<label>Last name <n-input v-model:value="inputValue.lastname" /></label>
								<label class="profile-nickname">Partner nickname <n-input v-model:value="inputValue.partnerPseudo" /></label>
								<button type="submit" class="button-3D button-3D-colorful profile-save">Save</button>
							</form>
						</n-collapse-item>

						<n-collapse-item name="theme">
							<template #header>
								<span class="settings-heading"><SwatchIcon aria-hidden="true" /> Theme</span>
							</template>
							<div class="settings-panel settings-theme">
								<div>
									<h3>Color palette</h3>
									<ThemeSwitcher />
								</div>
								<div>
									<h3>Badge</h3>
									<BadgeSwitcher />
								</div>
								<fieldset>
									<legend>Card style</legend>
									<div class="card-style-options">
										<label v-for="style in cardStyles" :key="style">
											<input type="radio" name="card-style" :checked="themeStore.cardStyle === style" @change="themeStore.setCardStyle(style)" />
											<span class="card-style-preview" :class="'preview-' + style" aria-hidden="true">
												<i></i><i></i>
											</span>
											<span>{{ style }}</span>
										</label>
									</div>
								</fieldset>
							</div>
						</n-collapse-item>

						<n-collapse-item name="notifications">
							<template #header>
								<span class="settings-heading"><BellIcon aria-hidden="true" /> Notifications</span>
							</template>
							<div class="settings-panel">
								<div class="settings-notifications">
									<span>Push notifications</span>
									<n-switch
										class="settings-push-switch"
										v-model:value="notificationsEnabled"
										size="large"
										:rail-style="notificationRailStyle"
										:loading="loading"
										aria-label="Push notifications"
										@update:value="toggleNotifications"
									>
										<template #checked>Enabled</template>
										<template #unchecked>Disabled</template>
									</n-switch>
								</div>
								<p class="settings-status">{{ statusText }}</p>
							</div>
						</n-collapse-item>
					</n-collapse>
					<button type="button" class="button-3D button-3D-colorful-error settings-logout" @click="logout">
						Logout
					</button>
				</div>
			</n-drawer-content>
		</n-drawer>

		<!-- inbox drawer -->
		<n-drawer
			:show="showInbox"
			@update:show="updateInbox"
			:height="650"
			placement="bottom"
			:block-scroll="true"
			:trap-focus="false"
			style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
		>
			<n-drawer-content
				:native-scrollbar="false"
				class="drawer-gradient-background"
				:style="{
					'--theme-color': currentLightThemeColor,
					'border-top-left-radius': '2rem',
					'border-top-right-radius': '2rem',
				}"
			>
				<template #header>
					<div class="modal-header">
						<span class="font-color" :style="{ fontWeight: '700' }">Inbox</span>
					</div>
				</template>

				<ActivityInbox v-if="showInbox" :focused-id="focusedActivityId" :focused-kind="focusedKind" />
			</n-drawer-content>
		</n-drawer>
	</div>

	<NewItemModal v-model:show="showNewItemModal" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { BellIcon, InboxIcon, Squares2X2Icon, SwatchIcon, UserIcon, WalletIcon } from '@heroicons/vue/24/outline'
import { usePseudoStore } from '~/stores/pseudo'
import { useThemeStore } from '~/stores/theme'
import { useUserStore } from '~/stores/user'

const themeStore = useThemeStore()
const userStore = useUserStore()
const pseudoStore = usePseudoStore()

const {
	permission,
	notificationsEnabled,
	loading,
	isSupported,
	loadStoredPermission,
	loadStoredEnabled,
	saveEnabled,
	requestPermission,
	disableNotifications,
} = usePushNotifications()

function notificationRailStyle({ checked }: { checked: boolean }) {
	return {
		background: checked ? '#cceada' : '#eceef2',
		color: checked ? '#24543c' : '#424b5b',
		boxShadow: checked ? '0 3px 0 #96bfa7' : '0 3px 0 #b9bfcb',
	}
}

const { logout } = useAuth()

const showAccount = ref(false)
const cardStyles = ['elevated', 'flat'] as const
const showInbox = ref(false)
const route = useRoute()
const router = useRouter()
const focusedKind = computed(() => {
	if (typeof route.query.contract === 'string') return 'contract'
	return typeof route.query.reward === 'string' ? 'reward' : 'violation'
})
const focusedActivityId = computed(() => {
	const id = route.query[focusedKind.value]
	return typeof id === 'string' && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id) ? id : null
})

watch([focusedActivityId, focusedKind], ([id]) => {
	if (id) showInbox.value = true
}, { immediate: true })

function updateInbox(show: boolean) {
	showInbox.value = show
	if (!show && focusedActivityId.value) {
		// Remove the consumed link so tapping the same notification can open it again.
		void router.replace({ query: { ...route.query, violation: undefined, reward: undefined, contract: undefined } })
	}
}
const showSettings = ref(false)

let showNewItemModal = ref(false)

const currentThemeColor = computed(() => themeStore.themeColor)
const currentLightThemeColor = computed(() => themeStore.lightThemeColor)

const statusText = computed(() => {
	if (!isSupported.value) {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches
		if (isIOS && !isStandalone) {
			return '⚠️ iOS: Please install app (Add to Home Screen) to enable notifications'
		}
		return '⚠️ Notifications not supported in this browser'
	}
	if (loading.value) return 'Processing...'
	if (!notificationsEnabled.value) return 'Notifications are disabled'
	if (permission.value === 'denied')
		return 'Browser blocked notifications. Please enable in browser settings.'
	if (permission.value === 'granted') return 'Notifications are enabled'
	return 'Notifications ready to enable'
})

const inputValue = reactive({
	firstname: '',
	lastname: '',
	partnerPseudo: '',
})

onMounted(() => {
	loadStoredPermission()
	loadStoredEnabled()
})

const toggleNotifications = async (val: boolean) => {
	console.log(`🔄 Toggle notifications: ${val}`)

	// Check if notifications are supported
	if (!isSupported.value) {
		console.warn('⚠️ Notifications not supported')
		notificationsEnabled.value = false
		return
	}

	saveEnabled(val) // Always save user preference

	// User turned notifications OFF
	if (!val) {
		console.log('🔕 Turning OFF notifications')
		await disableNotifications()
		return
	}

	console.log('🔔 User toggled ON notifications')

	// CASE 1 → Browser already allowed notifications
	if (Notification.permission === 'granted') {
		console.log('📬 Browser already granted permission → registering subscription')
		const result = await requestPermission()
		if (result !== 'granted') {
			console.log('⚠ Failed to set up subscription')
			saveEnabled(false)
			notificationsEnabled.value = false
		}
		return
	}

	// CASE 2 → Browser previously blocked this site
	if (Notification.permission === 'denied') {
		console.log('❌ Browser is blocking notifications')
		// Keep switch ON but show message that browser blocked it
		return
	}

	// CASE 3 → User never answered before ("default")
	if (Notification.permission === 'default') {
		console.log('🟡 Permission is default → showing permission popup')

		const result = await requestPermission()

		if (result !== 'granted') {
			console.log('⚠ User dismissed or denied permission → switch OFF')
			saveEnabled(false)
			notificationsEnabled.value = false
		}

		return
	}
}

const originalValues = reactive({
	firstname: '',
	lastname: '',
	partnerPseudo: '',
})

const activateSettingsDrawer = () => {
	showSettings.value = true
}
const activateInboxDrawer = () => {
	showInbox.value = true
}

const activateAccountDrawer = () => {
	showAccount.value = true
	// Load values from the userStore
	inputValue.firstname = userStore.profile?.firstname ?? ''
	inputValue.lastname = userStore.profile?.lastname ?? ''
	inputValue.partnerPseudo = pseudoStore.partnerPseudo ?? ''

	// Save original values to compare later
	originalValues.firstname = inputValue.firstname
	originalValues.lastname = inputValue.lastname
	originalValues.partnerPseudo = inputValue.partnerPseudo
}

const getChangedFields = (originalValues: any, currentValues: any) => {
	return Object.fromEntries(
		Object.entries(currentValues).filter(([key, value]) => value !== originalValues[key])
	)
}

const saveChanges = async () => {
	const changed = getChangedFields(originalValues, inputValue)

	if (changed.firstname || changed.lastname) {
		await userStore.updateProfile(changed.firstname as string, changed.lastname as string)
	}

	if (changed.partnerPseudo) {
		await pseudoStore.updatePartnerPseudo(changed.partnerPseudo as string)
	}

	showAccount.value = false
}
</script>

<style lang="scss">
.bottom-menu-bar {
	padding: 0.5rem 1.5rem;
	background-color: rgba(255, 255, 255, 0.6);
	border-top: 1px solid rgba(0, 0, 0, 0.08);
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(2px);
	border-radius: 2rem;

	.items {
		gap: 2rem;

		.item {
			cursor: pointer;
			transition: opacity 0.2s ease;

			&:hover {
				opacity: 0.8;
			}

			.icon {
				margin: 1rem;
			}
		}
	}
}

.n-input {
	height: 5rem;
	display: flex;
	justify-content: center;
	align-items: center;

	&:hover,
	&:focus,
	&:focus-within {
		--n-border-hover: transparent !important;
		--n-border-focus: transparent !important;
		--n-box-shadow-focus: transparent !important;
		box-shadow: none !important;
		border: none !important;
		--n-caret-color: v-bind(currentThemeColor) !important;
		outline: none !important;
	}
}

input {
	padding: 0.5rem 1.5rem;
	border-radius: 1rem;
	border: none;
	outline: none;
	font-size: 1.5rem;
	font-weight: 600;
	color: #555555;
	transition: padding 0.3s 0.2s ease;
	resize: none;
}

.n-collapse .n-collapse-item .n-collapse-item__header .n-collapse-item__header-main {
	font-weight: 700;
}

.drawer-body {
	overflow: hidden;
}

.drawer-gradient-background {
	position: relative;

	background: linear-gradient(
		to bottom,
		#f9f9fb 10%,
		#f9f9fb 45%,
		color-mix(in srgb, var(--theme-color) 10%, #f9f9fb) 80%,
		color-mix(in srgb, var(--theme-color) 25%, #f9f9fb) 100%
	);

	background-attachment: fixed;
}

// .drawer-gradient-background::before {
// 	content: '';
// 	position: absolute;
// 	inset: 0;
// 	pointer-events: none;
// 	z-index: 0;

// 	background: linear-gradient(
// 		135deg,
// 		transparent 0%,
// 		transparent 50%,
// 		color-mix(in srgb, var(--theme-color) 3%, transparent) 100%
// 	);

// 	opacity: 0.25;
// }

.drawer-gradient-background > * {
	position: relative;
	z-index: 1;
}
.account-settings { display: grid; gap: 1.5rem; padding: 0.5rem 0.25rem 2rem; color: #475569; }
.settings-heading { display: inline-flex; align-items: center; gap: 0.65rem; font-weight: 700; }
.settings-heading svg { width: 2.5rem; height: 2.5rem; padding: 0.45rem; border-radius: 0.75rem; background: var(--theme-color); color: #344054; }
.settings-panel {
	padding: 1rem;
	border: 1px solid color-mix(in srgb, var(--primary-color) 17%, transparent);
	border-radius: 1.1rem;
	background: #ffffffeb;
	box-shadow: 0 3px 0 color-mix(in srgb, var(--primary-color) 12%, transparent), 0 5px 12px #0000000a;
}
.profile-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.profile-fields label { display: grid; gap: 0.35rem; min-width: 0; font-weight: 600; }
.profile-nickname, .profile-save { grid-column: 1 / -1; }
.profile-save { margin-top: 0.5rem; }
.settings-theme { display: grid; gap: 1.1rem; }
.settings-theme h3, .settings-theme legend { margin-bottom: 0.5rem; font-weight: 700; }
.settings-theme fieldset { min-width: 0; }
.settings-notifications { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; justify-content: space-between; font-weight: 600; }
.settings-push-switch :deep(.n-switch__button) { box-shadow: 0 2px 4px #0002; }
.settings-push-switch:focus-within { outline: 2px solid var(--primary-color); outline-offset: 3px; border-radius: 999px; }
.settings-status { margin-top: 0.55rem; font-size: 1.15rem; color: #64748b; }
.settings-logout { justify-self: center; width: min(100%, 14rem); }
.card-style-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.65rem; }
.card-style-options label {
	position: relative;
	display: grid;
	gap: 0.6rem;
	justify-items: center;
	padding: 0.75rem 0.4rem;
	border: 1px solid #e5e7eb;
	border-radius: 0.85rem;
	background: #f9fafb;
	cursor: pointer;
	text-transform: capitalize;
	font-weight: 600;
}
.card-style-options label:has(input:checked) { border-color: var(--primary-color); background: color-mix(in srgb, var(--theme-color) 48%, white); }
.card-style-options label:focus-within { outline: 2px solid var(--primary-color); outline-offset: 2px; }
.card-style-options input { position: absolute; top: 0.5rem; right: 0.5rem; accent-color: var(--primary-color); }
.card-style-preview { display: grid; align-content: center; gap: 0.25rem; width: 3.8rem; height: 2.3rem; padding: 0.45rem; border-radius: 0.5rem; background: white; }
.card-style-preview i { display: block; height: 2px; width: 75%; border-radius: 1px; background: var(--theme-color); }
.card-style-preview i + i { width: 50%; }
.preview-elevated { box-shadow: 0 3px 6px #0003; }
.preview-flat { border: 1px solid color-mix(in srgb, var(--primary-color) 35%, white); }
</style>
