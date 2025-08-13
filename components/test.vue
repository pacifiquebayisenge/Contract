<template>
  <div>
    <!-- Update Available Notification -->
    <div
      v-if="showUpdateNotification"
      class="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-400" />
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-blue-800">Update Available</h3>
          <p class="mt-1 text-sm text-blue-700">A new version of Ugovor is available. Restart to update.</p>
          <div class="mt-3 flex space-x-2">
            <n-button size="small" @click="dismissUpdate">
              Later
            </n-button>
            <n-button size="small" type="primary" @click="updateSW">
              Update Now
            </n-button>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="text-blue-400 hover:text-blue-600" @click="dismissUpdate">
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Install App Prompt -->
    <div
      v-if="showInstallPrompt"
      class="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon name="heroicons:arrow-down-tray" class="h-5 w-5 text-green-400" />
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-green-800">Install Ugovor</h3>
          <p class="mt-1 text-sm text-green-700">Install Ugovor as an app for better experience and offline access.</p>
          <div class="mt-3 flex space-x-2">
            <n-button size="small" @click="dismissInstall">
              Not Now
            </n-button>
            <n-button size="small" type="primary" @click="installApp">
              Install
            </n-button>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <button class="text-green-400 hover:text-green-600" @click="dismissInstall">
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- PWA Status Debug (only in dev) -->
    <div v-if="isDev && showDebug" class="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs">
      <div><strong>PWA Status:</strong></div>
      <div>SW Registered: {{ swRegistered ? '✓' : '✗' }}</div>
      <div>Update Available: {{ updateAvailable ? '✓' : '✗' }}</div>
      <div>Installable: {{ installable ? '✓' : '✗' }}</div>
      <div>Offline Ready: {{ offlineReady ? '✓' : '✗' }}</div>
      <button class="mt-2 text-xs underline" @click="showDebug = false">Hide</button>
    </div>

    <!-- Debug Toggle (only in dev) -->
    <button
      v-if="isDev && !showDebug"
      class="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full text-xs"
      title="Show PWA Debug"
      @click="showDebug = true"
    >
      PWA
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const isDev = process.env.NODE_ENV === 'development'
const showDebug = ref(false)
const showUpdateNotification = ref(false)
const showInstallPrompt = ref(false)
const swRegistered = ref(false)
const installable = ref(false)
const deferredPrompt = ref(null)

// PWA Register SW composable
const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegistered(registration) {
    console.log('SW Registered:', registration)
    swRegistered.value = true
  },
  onRegisterError(error) {
    console.error('SW registration error:', error)
  },
})

// Watch for updates
watch(needRefresh, (needRefresh) => {
  if (needRefresh) {
    console.log('update found')
    showUpdateNotification.value = true
  }
})

// Update service worker
const updateSW = async () => {
  try {
    await updateServiceWorker(true)
    showUpdateNotification.value = false
  } catch (error) {
    console.error('Failed to update SW:', error)
  }
}

const dismissUpdate = () => {
  showUpdateNotification.value = false
}

// Handle app installation
const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    console.log(`User response to install prompt: ${outcome}`)
    deferredPrompt.value = null
    showInstallPrompt.value = false
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  // Don't show again for this session
  sessionStorage.setItem('installPromptDismissed', 'true')
}

onMounted(() => {
  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt available')
    e.preventDefault()
    deferredPrompt.value = e
    installable.value = true
    
    // Show install prompt if not dismissed this session
    if (!sessionStorage.getItem('installPromptDismissed')) {
      // Delay showing the prompt a bit
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 3000)
    }
  })

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    showInstallPrompt.value = false
    deferredPrompt.value = null
  })

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running as PWA')
  }
})
</script>