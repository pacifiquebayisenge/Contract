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
			:height="650"
			placement="bottom"
			:auto-focus="false"
			:block-scroll="true"
			:trap-focus="false"
			style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
		>
			<n-drawer-content
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

				<div class="drawer-body invisible-scroll h-[100%]">
					<div class="account-items px-5 h-[100%] flex flex-col justify-between overflow-y-auto">
						<n-collapse arrow-placement="right" class="mb-16">
							<n-collapse-item title="names" name="1">
								<div class="px-3">
									<n-input
										v-model:value="inputValue.firstname"
										class="bg-[#0000000a] rounded-[1rem] my-5"
										type="text"
										placeholder="Firstname"
									/>

									<n-input
										v-model:value="inputValue.lastname"
										class="bg-[#0000000a] rounded-[1rem] my-5"
										type="text"
										placeholder="Lastname"
									/>

									<n-input
										v-model:value="inputValue.partnerPseudo"
										class="bg-[#0000000a] rounded-[1rem] my-5"
										type="text"
										placeholder="Partner Pseudo"
									/>

									<button class="button-3D button-3D-colorful my-6 font-color" @click="saveChanges">
										Save
									</button>
									<n-divider />
								</div>
							</n-collapse-item>

							<n-collapse-item title="Theme" name="2">
								<div class="px-3">
									<span>Primary</span>
									<ThemeSwitcher />

									<n-divider />

									<span>Badge</span>
									<BadgeSwitcher />

									<n-divider />
								</div>
							</n-collapse-item>

							<n-collapse-item title="Notifications" name="3">
								<div class="px-3">
									<n-space vertical>
										<span>Push Notifications</span>

										<n-switch
											v-model:value="notificationsEnabled"
											:loading="loading"
											@update:value="toggleNotifications"
										>
											<template #checked>Enabled</template>
											<template #unchecked>Disabled</template>
										</n-switch>

										<n-text depth="3" style="font-size: 12px">
											{{ statusText }}
										</n-text>
									</n-space>
								</div>
							</n-collapse-item>
						</n-collapse>

						<button class="button-3D button-3D-colorful-error my-6 mb-20" @click="logout">
							Logout
						</button>
					</div>
				</div>
			</n-drawer-content>
		</n-drawer>

		<!-- inbox drawer -->
		<n-drawer
			v-model:show="showInbox"
			:height="650"
			placement="bottom"
			:block-scroll="true"
			:trap-focus="false"
			style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
		>
			<n-drawer-content
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

				<div class="drawer-body invisible-scroll">
					<div class="settings-items px-5 mb-24">
						<n-collapse arrow-placement="right">
							<n-collapse-item title="Primary" name="1">
								<div>
									<EmptyState />
								</div>
							</n-collapse-item>

							<n-collapse-item title="Events" name="2">
								<EmptyState />
								<!-- <div class="overflow-y-auto">
									<EventItem v-for="(event, index) in getAllEvents" :index="index" :item="event" />
								</div> -->
							</n-collapse-item>
						</n-collapse>
					</div>
				</div>
			</n-drawer-content>
		</n-drawer>
	</div>

	<NewItemModal v-model:show="showNewItemModal" />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { InboxIcon, Squares2X2Icon, UserIcon, WalletIcon } from '@heroicons/vue/24/outline'
import { useEventsHistory } from '~/composables/useEventsHistory'
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

const { getAllEvents } = useEventsHistory()

const { logout } = useAuth()

const showAccount = ref(false)
const showInbox = ref(false)
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
</style>
