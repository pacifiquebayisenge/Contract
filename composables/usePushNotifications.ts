import { ref } from 'vue'

const STORAGE_KEY_PERMISSION = 'push-permission'
const STORAGE_KEY_ENABLED = 'notifications-enabled'

export function usePushNotifications() {
  const permission = ref<NotificationPermission>('default') // browser permission
  const notificationsEnabled = ref<boolean>(false) // user setting
  const loading = ref(false)
  const isSupported = ref(false)

  // Check if notifications are supported
  if (import.meta.client && typeof window !== 'undefined') {
    isSupported.value = 'Notification' in window && 'serviceWorker' in navigator
  }

  // Load browser permission + user setting
  const loadStoredPermission = () => {
    if (!import.meta.client || !isSupported.value) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PERMISSION) as NotificationPermission | null
      permission.value = stored || Notification.permission
    } catch (error) {
      console.error('Error loading stored permission:', error)
    }
  }

  const loadStoredEnabled = () => {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENABLED)
      notificationsEnabled.value = stored === 'true'
    } catch (error) {
      console.error('Error loading stored enabled:', error)
    }
  }

  const saveEnabled = (enabled: boolean) => {
    if (!import.meta.client) return
    notificationsEnabled.value = enabled
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false')
  }

  const savePermission = (status: NotificationPermission) => {
    if (!import.meta.client) return
    permission.value = status
    localStorage.setItem(STORAGE_KEY_PERMISSION, status)
  }

  // Request browser permission ONLY when user toggles ON
  const requestPermission = async () => {
    if (!import.meta.client) return 'default'

    if (!isSupported.value) {
      console.warn('⚠️ Notifications not supported in this browser/mode')
      return 'denied'
    }

    loading.value = true

    try {
      const result = await Notification.requestPermission()
      savePermission(result)

      if (result === 'granted') {
        const config = useRuntimeConfig()

        // Wait for service worker to be ready (auto-registered by @vite-pwa/nuxt)
        // Don't manually register - let the PWA module handle it
        if (!navigator.serviceWorker.controller) {
          console.log('⏳ Waiting for service worker to be ready...')
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        const registration = await navigator.serviceWorker.ready
        console.log('✅ Service worker ready:', registration.scope)

        let subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(config.public.publicVapid),
          })
        }

        // Try to save subscription to backend
        try {
          await $fetch('/api/save-subscription', {
            method: 'POST',
            body: subscription.toJSON(),
          })
          console.log('✅ Subscription saved to backend')
        } catch (apiError: any) {
          console.error('❌ Failed to save subscription to backend:', apiError)

          // If API is not available (404), store subscription locally for later
          if (apiError.status === 404 || apiError.statusCode === 404) {
            console.warn(
              "⚠️ API not available. This might be because you're running a static build."
            )
            console.warn(
              '💡 Use "pnpm build && pnpm start" instead of "pnpm generate" for full functionality'
            )

            // Store subscription in localStorage as fallback
            if (import.meta.client) {
              localStorage.setItem(
                'pending-push-subscription',
                JSON.stringify(subscription.toJSON())
              )
            }
          }
        }
      }

      loading.value = false
      return result
    } catch (error) {
      console.error('❌ Error requesting permission:', error)
      loading.value = false
      return 'denied'
    }
  }

  // App-level "OFF"
  const disableNotifications = async () => {
    if (!import.meta.client) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // 1. Try to send endpoint to backend to delete from DB
        try {
          await $fetch('/api/remove-subscription', {
            method: 'POST',
            body: {
              endpoint: subscription.endpoint,
            },
          })
          console.log('✅ Subscription removed from backend')
        } catch (apiError: any) {
          console.error('❌ Failed to remove subscription from backend:', apiError)

          // If API not available, just continue with local unsubscribe
          if (apiError.status === 404 || apiError.statusCode === 404) {
            console.warn('⚠️ API not available, but continuing with local unsubscribe')
          }
        }

        // 2. Unsubscribe browser regardless of backend result
        await subscription.unsubscribe()
        console.log('✅ Browser subscription removed')
      }

      // 3. Clear local storage
      if (import.meta.client) {
        localStorage.removeItem('pending-push-subscription')
      }

      saveEnabled(false)
    } catch (error) {
      console.error('❌ Error disabling notifications:', error)
    }
  }

  // Check if there's a pending subscription to sync
  const syncPendingSubscription = async () => {
    if (!import.meta.client) return

    const pending = localStorage.getItem('pending-push-subscription')
    if (!pending) return

    console.log('📤 Found pending subscription, attempting to sync...')

    try {
      const subscription = JSON.parse(pending)

      await $fetch('/api/save-subscription', {
        method: 'POST',
        body: subscription,
      })

      console.log('✅ Pending subscription synced successfully')
      localStorage.removeItem('pending-push-subscription')
    } catch (error) {
      console.error('❌ Failed to sync pending subscription:', error)
      // Keep it in localStorage for next time
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  return {
    // state
    permission,
    notificationsEnabled,
    loading,
    isSupported,

    // load/save
    loadStoredPermission,
    loadStoredEnabled,
    saveEnabled,

    // actions
    requestPermission,
    disableNotifications,
    syncPendingSubscription,
  }
}
