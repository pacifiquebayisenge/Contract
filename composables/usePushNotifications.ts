import { ref } from 'vue'

const STORAGE_KEY_PERMISSION = 'push-permission'
const STORAGE_KEY_ENABLED = 'notifications-enabled'

export function usePushNotifications() {
  const permission = ref<NotificationPermission>('default') // browser permission
  const notificationsEnabled = ref<boolean>(false) // user setting
  const loading = ref(false)

  // Load browser permission + user setting
  const loadStoredPermission = () => {
    const stored = localStorage.getItem(STORAGE_KEY_PERMISSION) as NotificationPermission | null
    permission.value = stored || Notification.permission
  }

  const loadStoredEnabled = () => {
    const stored = localStorage.getItem(STORAGE_KEY_ENABLED)
    notificationsEnabled.value = stored === 'true'
  }

  const saveEnabled = (enabled: boolean) => {
    notificationsEnabled.value = enabled
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false')
  }

  const savePermission = (status: NotificationPermission) => {
    permission.value = status
    localStorage.setItem(STORAGE_KEY_PERMISSION, status)
  }

  // Request browser permission ONLY when user toggles ON
  const requestPermission = async () => {
    loading.value = true

    const result = await Notification.requestPermission()
    savePermission(result)

    if (result === 'granted') {
      const config = useRuntimeConfig()
      const registration = await navigator.serviceWorker.register('/sw.js')

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config.public.publicVapid),
        })
      }

      await $fetch('/api/save-subscription', {
        method: 'POST',
        body: subscription,
      })
    }

    loading.value = false
    return result
  }

  // App-level "OFF"
  const disableNotifications = async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = await registration?.pushManager.getSubscription()

    if (subscription) {
      // 1. Send endpoint to backend to delete from DB
      await $fetch('/api/remove-subscription', {
        method: 'POST',
        body: {
          endpoint: subscription.endpoint,
        },
      })

      // 2. Unsubscribe browser
      await subscription.unsubscribe()
    }

    saveEnabled(false)
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

    // load/save
    loadStoredPermission,
    loadStoredEnabled,
    saveEnabled,

    // actions
    requestPermission,
    disableNotifications,
  }
}
