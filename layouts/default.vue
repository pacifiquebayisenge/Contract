<template>
  <div class="flex flex-col min-h-screen">
    <div class="sticky top-0 z-50 flex justify-center items-center py-4">
      <TopNavBar />
    </div>

    <ThemeSwitcher/>
    <!-- Page content -->
    <div class="flex-1 px-6 py-2">
      <slot />
    </div>

    <!-- PWA Status Component -->
    <PwaStatus />
  </div>
</template>

<script setup>
import TopNavBar from "~/components/TopNavBar.vue";
</script>
