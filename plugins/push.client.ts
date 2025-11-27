import { until } from '@vueuse/core'

export default defineNuxtPlugin(async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('❌ No service worker support')
    return
  }
  // Wait for Supabase to finish hydrating the user session
  const user = useSupabaseUser()

  // Wait until user.value is not null
  // Wait for hydration (until user is not undefined)
  await until(() => toValue(user)).not.toBe(undefined)

  const config = useRuntimeConfig()

  const registerSW = async () => {
    console.log('🔧 Registering Service Worker…')

    const registration = await navigator.serviceWorker.register('/sw.js')

    let subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      console.log('📬 Existing push subscription found!')
    } else {
      console.log('📭 No push subscription yet — creating new subscription…')
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.public.publicVapid),
      })
      console.log('✅ Push subscription created:', subscription)
    }

    console.log('⬆ Sending subscription to backend…')
    await $fetch('/api/save-subscription', {
      method: 'POST',
      body: subscription,
    })
    console.log('📨 Subscription saved on backend')
  }

  // ---- REQUEST PERMISSION ----
  console.log('🛎 Requesting notification permission…')

  const permission = await Notification.requestPermission()

  if (permission === 'granted') {
    console.log('🎉 User granted permission — registering SW')
    await registerSW()
  } else if (permission === 'denied') {
    console.log('❌ User denied permission — push registration cancelled')
  } else {
    console.log('🟡 User dismissed/ignored permission dialog')
  }
})

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
