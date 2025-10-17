<template>
  <NModalProvider>
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

      <div
        class="fixed bottom-[40px] left-0 right-0 z-50 flex justify-center items-center pointer-events-none !bg-transparent"
      >
        <div class="pointer-events-auto">
          <BottomMenuBar />
        </div>
      </div>
    </div>
  </NModalProvider>
</template>

<script setup>
import { NModalProvider } from "naive-ui";
import BottomMenuBar from "~/components/BottomMenuBar.vue";
import TopNavBar from "~/components/TopNavBar.vue";
import PWAUpdateDialog from "~/components/PWAUpdateDialog.vue";
import PWAInstallPrompt from "~/components/PWAInstallPrompt.vue";
</script>

<style lang="scss">
div#app-container {
  overflow: hidden;
  height: 100vh;

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
