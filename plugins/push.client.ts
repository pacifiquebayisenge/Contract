export default defineNuxtPlugin(() => {
  if (!process.client) return

  onMounted(async () => {
    console.log('🌍 App fully mounted — push system activating')

    // --- SAFARI DETECTION & BLOCK ---
    if (!('Notification' in window)) {
      console.log('📵 Notifications NOT supported in this browser (iPhone Safari tab).')
      return
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    if (isSafari) {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches
      if (!isPWA) {
        console.log('📵 Safari detected — push only works in PWA (Add to Home Screen).')
        return
      }
    }

    if (!('serviceWorker' in navigator)) {
      console.log('❌ No service worker support')
      return
    }

    const config = useRuntimeConfig()
    const user = useSupabaseUser()

    await nextTick()
    console.log('👤 Supabase user:', user.value)

    // If permission already granted → register SW
    if (Notification.permission === 'granted') {
      console.log('🔔 Permission already granted — registering SW')
      await registerSW(config)
    } else {
      console.log('🔕 Permission NOT granted — waiting for user toggle')
    }
  })
})

async function registerSW(config: any) {
  console.log('🔧 Registering Service Worker…')

  const registration = await navigator.serviceWorker.register('/sw.js')

  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.public.publicVapid),
    })
  }

  console.log('⬆ Saving subscription to backend')
  await $fetch('/api/save-subscription', {
    method: 'POST',
    body: subscription,
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
