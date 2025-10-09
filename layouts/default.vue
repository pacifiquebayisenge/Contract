<template>
  <NModalProvider>
    <div class="flex flex-col min-h-screen">
      <div class="sticky top-0 z-50 flex justify-center items-center py-2 bg-white">
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
import { onMounted } from "vue";
import { useHead } from "#imports";

import { useThemeStore } from "~/stores/theme";

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.initializeTheme();
});

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);
useHead({
  meta: [{ name: currentThemeColor, content: "#ffffff", id: "theme-color" }],
});
</script>
