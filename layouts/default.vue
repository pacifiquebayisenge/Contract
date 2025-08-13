<template>
  <div>
    <TopNavBar />

    <div class="px-6 py-2">
      <slot />
    </div>

    <!-- PWA Status Component -->
    <PwaStatus />
  </div>
</template>

<script setup>
import TopNavBar from "~/components/TopNavBar.vue";


</script>


