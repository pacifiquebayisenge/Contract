<template>
  <div>
    <!-- Install App Prompt Modal -->
    <n-modal
      v-model:show="showInstallPrompt"
      :mask-closable="true"
      :close-on-esc="true"
      preset="card"
      class="themed-modal"
      style="width: 400px; max-width: 90vw;"
      title="Install Ugovor"
      :bordered="false"
      size="small"
      role="dialog"
      aria-labelledby="install-dialog-title"
    >
      <template #header>
        <div class="flex items-center">
          <Icon name="heroicons:arrow-down-tray" class="h-5 w-5 themed-icon mr-2" />
          <span class="themed-title">Install Ugovor</span>
        </div>
      </template>
      
      <div class="themed-content">
        <p class="text-sm themed-description">
          Install Ugovor as an app for better experience and offline access.
        </p>
      </div>
      
      <template #action>
        <div class="flex justify-end space-x-2">
          <n-button
            class="themed-secondary-btn"
            size="small"
            @click="dismissInstall"
          >
            Not Now
          </n-button>
          <n-button
            class="themed-primary-btn"
            type="primary"
            size="small"
            @click="installApp"
          >
            Install
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- Update Available Modal -->
    <n-modal
      v-model:show="showUpdateNotification"
      :mask-closable="true"
      :close-on-esc="true"
      preset="card"
      class="themed-modal update-modal"
      style="width: 400px; max-width: 90vw;"
      title="Update Available"
      :bordered="false"
      size="small"
      role="dialog"
    >
      <template #header>
        <div class="flex items-center">
          <Icon name="heroicons:arrow-path" class="h-5 w-5 themed-icon mr-2" />
          <span class="themed-title">Update Available</span>
        </div>
      </template>
      
      <div class="themed-content">
        <p class="text-sm themed-description">
          A new version is available. Refresh to update.
        </p>
      </div>
      
      <template #action>
        <div class="flex justify-end space-x-2">
          <n-button
            class="themed-secondary-btn"
            size="small"
            @click="dismissUpdate"
          >
            Later
          </n-button>
          <n-button
            class="themed-primary-btn"
            type="primary"
            size="small"
            @click="reloadForUpdate"
          >
            Update Now
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- PWA Status Debug -->
    <div
      v-if="showDebug"
      class="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-xs"
    >
      <div class="mb-2"><strong>PWA Status Debug:</strong></div>

      <div class="space-y-1 mb-3">
        <div>SW Registered: {{ swRegistered ? "✓" : "✗" }}</div>
        <div>Manifest: {{ manifestLoaded ? "✓" : "✗" }}</div>
        <div>Icons Available: {{ iconsAvailable ? "✓" : "✗" }}</div>
        <div>HTTPS: {{ isHttps ? "✓" : "✗" }}</div>
        <div>Install Available: {{ installable ? "✓" : "✗" }}</div>
        <div>Already Installed: {{ isInstalled ? "✓" : "✗" }}</div>
        <div>
          Latest Version: {{ latestVersionInstalled ? "✓" : "✗" }} ({{
            currentVersion || "Unknown"
          }})
        </div>
      </div>

      <div class="mb-3 text-xs">
        <div><strong>Install Criteria:</strong></div>
        <div class="pl-2">
          <div>• Web App Manifest: {{ manifestLoaded ? "✓" : "✗" }}</div>
          <div>• Valid Icons: {{ iconsAvailable ? "✓" : "✗" }}</div>
          <div>• Service Worker: {{ swRegistered ? "✓" : "✗" }}</div>
          <div>• HTTPS: {{ isHttps ? "✓" : "✗" }}</div>
          <div>• Not Installed: {{ !isInstalled ? "✓" : "✗" }}</div>
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
        <button
          class="w-full text-left bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
          @click="checkVersion"
        >
          🔍 Check Version
        </button>
      </div>

      <button class="text-xs underline hover:text-gray-300" @click="showDebug = false">
        Hide Debug
      </button>
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
import { ref, onMounted, computed } from "vue";
import { useThemeStore } from "~/stores/theme";

const showDebug = ref(false);
const showInstallPrompt = ref(true);
const showUpdateNotification = ref(false);
const swRegistered = ref(false);
const installable = ref(false);
const manifestLoaded = ref(false);
const iconsAvailable = ref(false);
const isHttps = ref(false);
const isInstalled = ref(false);
const deferredPrompt = ref(null);
const updateAvailable = ref(false);
const registration = ref(null);
const latestVersionInstalled = ref(false);
const currentVersion = ref(null);

const themeStore = useThemeStore();

// Get the current theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);

// Real update check
const checkForUpdate = async () => {
  if (registration.value && navigator.onLine) {
    try {
      await registration.value.update();
      console.log("Update check triggered on app launch");
    } catch (error) {
      console.error("Update check failed:", error);
    }
  } else {
    console.log("No update check: No SW registration or offline");
  }
};

// Check app version
const checkVersion = async () => {
  try {
    const response = await fetch("/version.json");
    if (response.ok) {
      const { version } = await response.json();
      currentVersion.value = version;
      const storedVersion = localStorage.getItem("appVersion");
      latestVersionInstalled.value = storedVersion === version;
      console.log(
        `Current version: ${version}, Stored version: ${storedVersion || "None"}`
      );
    } else {
      console.error("Failed to fetch version.json");
    }
  } catch (error) {
    console.error("Version check failed:", error);
  }
};

// Check functions
const checkManifest = async () => {
  try {
    const response = await fetch("/manifest.webmanifest");
    if (response.ok) {
      const manifest = await response.json();
      console.log("Manifest:", manifest);
      manifestLoaded.value = true;
    }
  } catch (error) {
    console.error("Manifest check failed:", error);
  }
};

const checkIcons = async () => {
  const iconUrls = ["/icon-192x192.png", "/icon-512x512.png"];
  let availableCount = 0;

  for (const url of iconUrls) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        availableCount++;
        console.log(`Icon available: ${url}`);
      } else {
        console.error(`Icon missing: ${url}`);
      }
    } catch (error) {
      console.error(`Icon check failed for ${url}:`, error);
    }
  }

  iconsAvailable.value = availableCount >= 2;
};

const triggerUpdate = () => {
  checkForUpdate();
};

const forceInstallPrompt = () => {
  showInstallPrompt.value = true;
};

// Install functions
const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    console.log(`Install prompt result: ${outcome}`);
    deferredPrompt.value = null;
    showInstallPrompt.value = false;

    if (outcome === "accepted") {
      isInstalled.value = true;
      // Store the current version on install
      if (currentVersion.value) {
        localStorage.setItem("appVersion", currentVersion.value);
        latestVersionInstalled.value = true;
      }
    }
  }
};

const dismissInstall = () => {
  showInstallPrompt.value = false;
  sessionStorage.setItem("installPromptDismissed", "true");
};

const reloadForUpdate = () => {
  // Update stored version on reload
  if (currentVersion.value) {
    localStorage.setItem("appVersion", currentVersion.value);
    latestVersionInstalled.value = true;
  }
  window.location.reload();
};

const dismissUpdate = () => {
  showUpdateNotification.value = false;
};

onMounted(() => {
  // Check HTTPS
  isHttps.value = location.protocol === "https:";

  // Check if already installed
  isInstalled.value = window.matchMedia("(display-mode: standalone)").matches;

  // Initial checks
  checkManifest();
  checkIcons();
  checkVersion(); // Check version on launch

  // Check for service worker and set up update listener
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      registration.value = reg;
      swRegistered.value = true;

      // Check for updates on app launch
      checkForUpdate();

      // Listen for updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              updateAvailable.value = true;
              showUpdateNotification.value = true;
              console.log("New update available!");
              // Fetch version again to update currentVersion
              checkVersion();
            }
          });
        }
      });
    });

    // Fallback: Check existing registrations
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      swRegistered.value = registrations.length > 0;
    });
  }

  // Listen for install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("Install prompt available!");
    e.preventDefault();
    deferredPrompt.value = e;
    installable.value = true;

    if (!sessionStorage.getItem("installPromptDismissed")) {
      setTimeout(() => {
        showInstallPrompt.value = true;
      }, 3000);
    }
  });

  // Listen for installation
  window.addEventListener("appinstalled", () => {
    console.log("App was installed!");
    showInstallPrompt.value = false;
    isInstalled.value = true;
    deferredPrompt.value = null;
    // Store version on install
    if (currentVersion.value) {
      localStorage.setItem("appVersion", currentVersion.value);
      latestVersionInstalled.value = true;
    }
  });
});
</script>

<style>
/* Theme-dependent styling for the modals */
.themed-modal {
  --theme-color: v-bind(currentThemeColor);
}

/* Custom styling for modal content with higher specificity */
.themed-modal :deep(.n-card) {
  background-color: color-mix(in srgb, v-bind(currentThemeColor) 5%, white) !important;
  border: 1px solid color-mix(in srgb, v-bind(currentThemeColor) 15%, white) !important;
}

.themed-modal :deep(.n-card-header) {
  background-color: color-mix(in srgb, v-bind(currentThemeColor) 8%, white) !important;
  border-bottom: 1px solid color-mix(in srgb, v-bind(currentThemeColor) 20%, white) !important;
}

/* Icon styling */
.themed-icon {
  color: color-mix(in srgb, v-bind(currentThemeColor) 80%, black);
}

/* Title styling */
.themed-title {
  color: color-mix(in srgb, v-bind(currentThemeColor) 90%, black);
  font-weight: 600;
}

/* Content area */
.themed-content {
  padding: 0.5rem 0;
}

/* Description text */
.themed-description {
  color: color-mix(in srgb, v-bind(currentThemeColor) 70%, black);
  line-height: 1.4;
  font-weight: 500;
}

/* Button styling with higher specificity */
.themed-modal :deep(.themed-secondary-btn.n-button) {
  background-color: white !important;
  border-color: color-mix(in srgb, v-bind(currentThemeColor) 30%, white) !important;
  color: color-mix(in srgb, v-bind(currentThemeColor) 80%, black) !important;
}

.themed-modal :deep(.themed-secondary-btn.n-button:hover) {
  background-color: color-mix(in srgb, v-bind(currentThemeColor) 5%, white) !important;
  border-color: color-mix(in srgb, v-bind(currentThemeColor) 40%, white) !important;
}

.themed-modal :deep(.themed-primary-btn.n-button--primary-type) {
  background-color: v-bind(currentThemeColor) !important;
  border-color: v-bind(currentThemeColor) !important;
}

.themed-modal :deep(.themed-primary-btn.n-button--primary-type:hover) {
  background-color: color-mix(in srgb, v-bind(currentThemeColor) 85%, black) !important;
  border-color: color-mix(in srgb, v-bind(currentThemeColor) 85%, black) !important;
}

/* Custom backdrop styling */
.themed-modal :deep(.n-modal-mask) {
  background-color: rgba(0, 0, 0, 0.4) !important;
}

/* Fallback for browsers that don't support color-mix */
@supports not (color: color-mix(in srgb, red, blue)) {
  /* Sage green fallback */
  [data-theme="sage-green"] .themed-modal :deep(.n-card) {
    background-color: #f8faf8 !important;
    border-color: #d4e4d1 !important;
  }
  
  [data-theme="sage-green"] .themed-modal :deep(.n-card-header) {
    background-color: #f0f4f0 !important;
    border-bottom-color: #c3d3c0 !important;
  }
  
  [data-theme="sage-green"] .themed-icon {
    color: #6b7c67;
  }
  
  [data-theme="sage-green"] .themed-title {
    color: #4a5947;
  }
  
  [data-theme="sage-green"] .themed-description {
    color: #5a6b57;
  }
  
  [data-theme="sage-green"] .themed-modal :deep(.themed-secondary-btn.n-button) {
    border-color: #a8b8a5 !important;
    color: #5a6b57 !important;
  }
  
  [data-theme="sage-green"] .themed-modal :deep(.themed-primary-btn.n-button--primary-type) {
    background-color: #8A9A86 !important;
  }
  
  /* Dark blue fallback */
  [data-theme="dark-blue"] .themed-modal :deep(.n-card) {
    background-color: #f8faff !important;
    border-color: #c7d2fe !important;
  }
  
  [data-theme="dark-blue"] .themed-modal :deep(.n-card-header) {
    background-color: #eff6ff !important;
    border-bottom-color: #bfdbfe !important;
  }
  
  [data-theme="dark-blue"] .themed-icon {
    color: #1d4ed8;
  }
  
  [data-theme="dark-blue"] .themed-title {
    color: #1e3a8a;
  }
  
  [data-theme="dark-blue"] .themed-description {
    color: #3730a3;
  }
  
  [data-theme="dark-blue"] .themed-modal :deep(.themed-secondary-btn.n-button) {
    border-color: #93c5fd !important;
    color: #3730a3 !important;
  }
  
  [data-theme="dark-blue"] .themed-modal :deep(.themed-primary-btn.n-button--primary-type) {
    background-color: #1E3A8A !important;
  }
  
  /* Light pink fallback */
  [data-theme="light-pink"] .themed-modal :deep(.n-card) {
    background-color: #fefaff !important;
    border-color: #f5d0fe !important;
  }
  
  [data-theme="light-pink"] .themed-modal :deep(.n-card-header) {
    background-color: #fef7ff !important;
    border-bottom-color: #f3e8ff !important;
  }
  
  [data-theme="light-pink"] .themed-icon {
    color: #ec4899;
  }
  
  [data-theme="light-pink"] .themed-title {
    color: #be185d;
  }
  
  [data-theme="light-pink"] .themed-description {
    color: #db2777;
  }
  
  [data-theme="light-pink"] .themed-modal :deep(.themed-secondary-btn.n-button) {
    border-color: #f9a8d4 !important;
    color: #db2777 !important;
  }
  
  [data-theme="light-pink"] .themed-modal :deep(.themed-primary-btn.n-button--primary-type) {
    background-color: #F9A8D4 !important;
  }
}
</style>