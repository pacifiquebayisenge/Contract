<template>
  <NModalProvider>
    <div id="app-container" class="flex flex-col h-screen">
      <div
        class="sticky top-0 z-50 flex justify-center items-center py-2 bg-white rounded-t-3xl flex-shrink-0"
        style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
      >
        <TopNavBar />
      </div>
      <!-- Page content -->
      <div class="flex-1 px-6 py-2 pb-18 overflow-y-auto">
        <slot />
      </div>

      <PWAUpdateDialog />
      <PWAInstallPrompt />

      <div
        class="fixed bottom-[40px] left-0 right-0 z-50 flex justify-center items-center pointer-events-none !bg-transparent"
      >
        <div class="pointer-events-auto">
          <BottomMenuBar />
        </div>
      </div>

      <!-- PWA Status Component -->
      <!-- <PwaStatus /> -->
    </div>
  </NModalProvider>
</template>

<script setup>
import { NModalProvider } from "naive-ui";
import BottomMenuBar from "~/components/BottomMenuBar.vue";
import TopNavBar from "~/components/TopNavBar.vue";
import PWAUpdateDialog from "~/components/PWAUpdateDialog.vue";
</script>

<style lang="scss">
div#app-container {
  overflow: hidden;

  & > div {
    background-color: white;
    background-clip: padding-box;
  }
}
</style>
