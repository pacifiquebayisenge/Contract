<template>
  <div>
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
            <button 
              class="px-3 py-1 text-xs bg-white border border-green-300 rounded text-green-700 hover:bg-green-50"
              @click="dismissInstall"
            >
              Not Now
            </button>
            <button 
              class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
              @click="installApp"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Available Notification -->
    <div
      v-if="showUpdateNotification"
      class="fixed top-20 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <Icon name="heroicons:arrow-path" class="h-5 w-5 text-blue-400" />
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-blue-800">Update Available</h3>
          <p class="mt-1 text-sm text-blue-700">A new version is available. Refresh to update.</p>
          <div class="mt-3 flex space-x-2">
            <button 
              class="px-3 py-1 text-xs bg-white border border-blue-300 rounded text-blue-700 hover:bg-blue-50"
              @click="dismissUpdate"
            >
              Later
            </button>
            <button 
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              @click="reloadForUpdate"
            >
              Update Now
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PWA Status Debug -->
    <div v-if="showDebug" class="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs">
      <div class="mb-2"><strong>PWA Status Debug:</strong></div>
      
      <div class="space-y-1 mb-3">
        <div>SW Registered: {{ swRegistered ? '✓' : '✗' }}</div>
        <div>Manifest: {{ manifestLoaded ? '✓' : '✗' }}</div>
        <div>Icons Available: {{ iconsAvailable ? '✓' : '✗' }}</div>
        <div>HTTPS: {{ isHttps ? '✓' : '✗' }}</div>
        <div>Install Available: {{ installable ? '✓' : '✗' }}</div>
        <div>Already Installed: {{ isInstalled ? '✓' : '✗' }}</div>
      </div>

      <div class="mb-3 text-xs">
        <div><strong>Install Criteria:</strong></div>
        <div class="pl-2">
          <div>• Web App Manifest: {{ manifestLoaded ? '✓' : '✗' }}</div>
          <div>• Valid Icons: {{ iconsAvailable ? '✓' : '✗' }}</div>
          <div>• Service Worker: {{ swRegistered ? '✓' : '✗' }}</div>
          <div>• HTTPS: {{ isHttps ? '✓' : '✗' }}</div>
          <div>• Not Installed: {{ !isInstalled ? '✓' : '✗' }}</div>
        </div>
      </div>

      <div class="space-y-1 mb-3 text-xs">
        <button 
          class="w-full text-left bg-gray-700 px-2 py-1 rounded hover:bg-gray-600" 
          @click="checkManifest"
        >
          🔍 Check Manifest
        </button>
        <button 
          class="w-full text-left bg-gray-700 px-2 py-1 rounded hover:bg-gray-600" 
          @click="checkIcons"
        >
          🖼️ Check Icons
        </button>
        <button 
          class="w-full text-left bg-gray-700 px-2 py-1 rounded hover:bg-gray-600" 
          @click="triggerUpdate"
        >
          🔄 Check for Updates
        </button>
        <button 
          class="w-full text-left bg-gray-700 px-2 py-1 rounded hover:bg-gray-600" 
          @click="forceInstallPrompt"
        >
          💾 Force Install Prompt
        </button>
      </div>

      <button class="text-xs underline hover:text-gray-300" @click="showDebug = false">Hide Debug</button>
    </div>

    <!-- Debug Toggle -->
    <button
      v-if="!showDebug"
      class="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full text-xs hover:bg-gray-700"
      title="Show PWA Debug"
      @click="showDebug = true"
    >
      PWA
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showDebug = ref(false)
const showInstallPrompt = ref(false)
const showUpdateNotification = ref(false)
const swRegistered = ref(false)
const installable = ref(false)
const manifestLoaded = ref(false)
const iconsAvailable = ref(false)
const isHttps = ref(false)
const isInstalled = ref(false)
const deferredPrompt = ref(null)
const updateAvailable = ref(false)
const registration = ref(null)

// Real update check
const checkForUpdate = async () => {
  if (registration.value && navigator.onLine) {
    try {
      await registration.value.update()
      console.log('Update check triggered on app launch')
    } catch (error) {
      console.error('Update check failed:', error)
    }
  } else {
    console.log('No update check: No SW registration or offline')
  }
}

// Check functions
const checkManifest = async () => {
  try {
    const response = await fetch('/manifest.webmanifest')
    if (response.ok) {
      const manifest = await response.json()
      console.log('Manifest:', manifest)
      manifestLoaded.value = true
    }
  } catch (error) {
    console.error('Manifest check failed:', error)
  }
}

const checkIcons = async () => {
  const iconUrls = ['/icon-192x192.png', '/icon-512x512.png']
  let availableCount = 0
  
  for (const url of iconUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        availableCount++
        console.log(`Icon available: ${url}`)
      } else {
        console.error(`Icon missing: ${url}`)
      }
    } catch (error) {
      console.error(`Icon check failed for ${url}:`, error)
    }
  }
  
  iconsAvailable.value = availableCount >= 2
}

const triggerUpdate = () => {
  checkForUpdate()
}

// Install functions
const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    console.log(`Install prompt result: ${outcome}`)
    deferredPrompt.value = null
    showInstallPrompt.value = false
    
    if (outcome === 'accepted') {
      isInstalled.value = true
    }
  }
}

const dismissInstall = () => {
  showInstallPrompt.value = false
  sessionStorage.setItem('installPromptDismissed', 'true')
}

const reloadForUpdate = () => {
  window.location.reload()
}

const dismissUpdate = () => {
  showUpdateNotification.value = false
}

onMounted(() => {
  // Check HTTPS
  isHttps.value = location.protocol === 'https:'
  
  // Check if already installed
  isInstalled.value = window.matchMedia('(display-mode: standalone)').matches
  
  // Initial checks
  checkManifest()
  checkIcons()
  
  // Check for service worker and set up update listener
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      registration.value = reg
      swRegistered.value = true

      // Check for updates on app launch
      checkForUpdate()

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              updateAvailable.value = true
              showUpdateNotification.value = true
              console.log('New update available!')
            }
          })
        }
      })
    })

    // Fallback: Check existing registrations
    navigator.serviceWorker.getRegistrations().then(registrations => {
      swRegistered.value = registrations.length > 0
    })
  }

  // Listen for install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt available!')
    e.preventDefault()
    deferredPrompt.value = e
    installable.value = true
    
    if (!sessionStorage.getItem('installPromptDismissed')) {
      setTimeout(() => {
        showInstallPrompt.value = true
      }, 3000)
    }
  })

  // Listen for installation
  window.addEventListener('appinstalled', () => {
    console.log('App was installed!')
    showInstallPrompt.value = false
    isInstalled.value = true
    deferredPrompt.value = null
  })
})
</script>