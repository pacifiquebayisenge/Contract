<template>
  <div v-if="showDebug" class="debug-overlay">
    <div class="debug-panel">
      <button @click="showDebug = false" class="close-btn">✕</button>

      <div class="debug-section">
        <div class="status-item" :class="{ active: isStandalone }">
          <strong>Standalone:</strong> {{ isStandalone ? '✅ YES' : '❌ NO' }}
        </div>

        <div class="status-item"><strong>Display Mode:</strong> {{ displayMode }}</div>

        <div class="status-item"><strong>Layout:</strong> {{ currentLayout }}</div>

        <div class="status-item"><strong>Route:</strong> {{ currentRoute }}</div>
      </div>

      <div class="debug-section">
        <div class="status-item" style="font-size: 11px; word-break: break-all">
          <strong>User Agent:</strong> {{ userAgent }}
        </div>
      </div>

      <div class="debug-section">
        <strong>Navigation Log:</strong>
        <div class="nav-log">
          <div v-for="(log, index) in navigationLog" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>

      <button @click="clearLog" class="clear-btn">Clear Log</button>
    </div>
  </div>

  <!-- Floating toggle button -->
  <button v-if="!showDebug" @click="showDebug = true" class="debug-toggle">🐛</button>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const showDebug = ref(false)
const navigationLog = ref<string[]>([])
const currentRoute = ref('')
const currentLayout = ref('')
const displayMode = ref('browser')
const isStandalone = ref(false)
const userAgent = ref('')

const route = useRoute()
const router = useRouter()

const updateStatus = () => {
  currentRoute.value = route.path
  currentLayout.value = (route.meta.layout as string) || 'default'

  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true

  if (isStandalone.value) {
    displayMode.value = 'standalone'
  } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
    displayMode.value = 'fullscreen'
  } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    displayMode.value = 'minimal-ui'
  } else {
    displayMode.value = 'browser'
  }
}

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  navigationLog.value.unshift(`[${timestamp}] ${message}`)
  if (navigationLog.value.length > 10) {
    navigationLog.value = navigationLog.value.slice(0, 10)
  }
}

const clearLog = () => {
  navigationLog.value = []
}

onMounted(() => {
  userAgent.value = navigator.userAgent
  updateStatus()
  addLog(`App mounted on ${route.path}`)

  // Watch for route changes
  router.afterEach((to, from) => {
    addLog(`${from.path} → ${to.path}`)
    updateStatus()

    // Check if we lost standalone mode
    setTimeout(() => {
      const stillStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true

      if (isStandalone.value && !stillStandalone) {
        addLog('⚠️ LOST STANDALONE MODE!')
      }
    }, 100)
  })

  // Check for display mode changes
  const mediaQuery = window.matchMedia('(display-mode: standalone)')
  mediaQuery.addEventListener('change', (e) => {
    addLog(e.matches ? 'Entered standalone' : 'Left standalone')
    updateStatus()
  })

  // Log any anchor clicks
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a')
    if (target) {
      const href = target.getAttribute('href')
      const isNuxtLink =
        target.classList.contains('router-link-active') || target.hasAttribute('to')
      addLog(`Clicked: ${href} (${isNuxtLink ? 'NuxtLink' : 'Regular <a>'})`)
    }
  })
})
</script>

<style scoped>
.debug-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.debug-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
}

.debug-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.status-item {
  padding: 8px;
  margin: 5px 0;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.status-item.active {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.nav-log {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
}

.log-item {
  font-size: 11px;
  font-family: monospace;
  padding: 4px 0;
  border-bottom: 1px solid #dee2e6;
}

.log-item:last-child {
  border-bottom: none;
}

.clear-btn {
  width: 100%;
  padding: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
}

.debug-toggle {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 999998;
}

.debug-toggle:active {
  transform: scale(0.95);
}
</style>
