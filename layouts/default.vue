<template>
  <NModalProvider>
    <div id="app-container" class="flex flex-col min-h-screen">
      <div
        class="sticky top-0 z-50 flex justify-center items-center py-2 bg-white rounded-t-3xl"
        style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
      >
        <TopNavBar />
      </div>
      <!-- Page content -->
      <div class="flex-1 px-6 py-2 pb-18">
        <slot />
      </div>

      <div class="sticky bottom-10 z-50 flex justify-center items-center py-4">
        <BottomMenuBar />
      </div>

      <!-- PWA Status Component -->
      <PwaStatus />
    </div>
  </NModalProvider>
</template>

<script setup>
import { NModalProvider } from "naive-ui";
import BottomMenuBar from "~/components/BottomMenuBar.vue";
import TopNavBar from "~/components/TopNavBar.vue";
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
