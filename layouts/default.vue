<template>
  <NModalProvider>
    <n-spin :show="authLoading.visible.value" size="large">
      <div id="app-container" class="flex flex-col h-screen">
        <div
          class="sticky top-0 z-50 flex justify-center items-center py-2 bg-white rounded-t-3xl flex-shrink-0"
          style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
        >
          <TopNavBar />
        </div>

        <!-- Scrollable page content only -->
        <main class="flex-1 overflow-hidden bg-white">
          <div class="h-full px-6 pt-[2rem] pb-18" style="padding-bottom: 15rem">
            <slot />
          </div>
        </main>

        <PWAUpdateDialog />
        <PWAInstallPrompt />
        <NavDebuuger />

        <div
          class="fixed bottom-[40px] left-0 right-0 z-50 flex justify-center items-center pointer-events-none !bg-transparent"
        >
          <div class="pointer-events-auto">
            <BottomMenuBar />
          </div>
        </div>
      </div>
    </n-spin>
  </NModalProvider>
</template>

<script setup>
import { NModalProvider } from 'naive-ui'
import BottomMenuBar from '~/components/BottomMenuBar.vue'
import NavDebuuger from '~/components/NavDebuuger.vue'
import PWAInstallPrompt from '~/components/PWAInstallPrompt.vue'
import PWAUpdateDialog from '~/components/PWAUpdateDialog.vue'
import TopNavBar from '~/components/TopNavBar.vue'

const nuxtApp = useNuxtApp()
const authLoading = nuxtApp.$authLoading

useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    },
  ],
})
</script>

<style lang="scss">
html,
body,
#__nuxt,
#app-container {
  height: 100vh; /* fallback */
  height: 100dvh; /* modern browsers */
  height: -webkit-fill-available; /* iOS ≤ 17 */
  margin: 0;
  padding: 0;
  overflow: hidden;
}

div#app-container {
  display: flex;
  flex-direction: column;
  overscroll-behavior: none;
  background: white;

  /* The magic combo */
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  height: 100dvh;
  height: -webkit-fill-available;

  /* Safe-area handling */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */

  /* Force iOS to respect these values */
  @supports (height: 100dvh) {
    height: 100dvh;
  }
  @supports (-webkit-touch-callout: none) {
    height: -webkit-fill-available;
  }

  & > div {
    background-color: white;
    background-clip: padding-box;
  }

  /* Ensure modal backdrops don't create scroll */
  .n-modal-container {
    position: fixed;
    overflow: hidden;
  }

  /* Prevent body scroll when modal is open */
  body.modal-open {
    overflow: hidden;
  }
}

/* Main content scroll area */
main {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 transparent;
}

main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
</style>
