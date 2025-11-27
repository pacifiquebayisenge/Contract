import { nextTick } from 'vue'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  // Use onNuxtReady for proper initialization timing
  const nuxtApp = useNuxtApp()

  nuxtApp.hook('app:mounted', async () => {
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

    // If permission already granted → register SW and subscribe
    if (Notification.permission === 'granted') {
      console.log('🔔 Permission already granted — setting up push subscription')
      await setupPushSubscription(config)
    } else {
      console.log('🔕 Permission NOT granted — waiting for user toggle')
    }

    // Listen for messages from service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          console.log('📬 Notification clicked in foreground:', event.data)
          // Handle notification click if needed
        }
      })
    }
  })
})

async function setupPushSubscription(config: any) {
  try {
    console.log('🔧 Setting up push subscription…')

    // Wait for service worker to be ready (Workbox-generated SW)
    const registration = await navigator.serviceWorker.ready
    console.log('✅ Service Worker ready:', registration)

    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      console.log('📱 Existing subscription found:', subscription.endpoint)
    } else {
      console.log('🆕 Creating new push subscription…')

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.public.publicVapid),
      })

      console.log('✅ New subscription created:', subscription.endpoint)
    }

    // Save subscription to backend
    console.log('⬆ Saving subscription to backend')
    await $fetch('/api/save-subscription', {
      method: 'POST',
      body: subscription.toJSON(),
    })

    console.log('✅ Subscription saved successfully')
  } catch (error) {
    console.error('❌ Error setting up push subscription:', error)
  }
}

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

// Export helper functions for manual subscription management
export const usePushNotifications = () => {
  const config = useRuntimeConfig()

  return {
    async requestPermission() {
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        console.log('🎉 Notification permission granted')
        await setupPushSubscription(config)
        return true
      } else {
        console.log('❌ Notification permission denied')
        return false
      }
    },

    async unsubscribe() {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await subscription.unsubscribe()

          // Remove from backend
          await $fetch('/api/remove-subscription', {
            method: 'POST',
            body: { endpoint: subscription.endpoint },
          })

          console.log('🔕 Unsubscribed from push notifications')
          return true
        }

        return false
      } catch (error) {
        console.error('❌ Error unsubscribing:', error)
        return false
      }
    },

    async getSubscription() {
      try {
        const registration = await navigator.serviceWorker.ready
        return await registration.pushManager.getSubscription()
      } catch (error) {
        console.error('❌ Error getting subscription:', error)
        return null
      }
    },

    async resubscribe() {
      try {
        await this.unsubscribe()
        await setupPushSubscription(config)
        return true
      } catch (error) {
        console.error('❌ Error resubscribing:', error)
        return false
      }
    },
  }
}
