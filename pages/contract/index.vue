<template>
  <div class="contract-page-container">
    <div class="action-buttons py-8 px-16 mb-8 flex gap-8">
      <button class="button-3D button-3D-colorfull">New</button>
    </div>

    <div class="scroll-container invisible-scroll page-bottom-padding">
      <n-infinite-scroll :distance="10" @load="handleLoad">
        <div v-for="i in count" :key="i" class="item">
          {{ i }}
        </div>
      </n-infinite-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useThemeStore } from "~/stores/theme";

const themeStore = useThemeStore();

// Computed property for dynamic theme color
const currentThemeColor = computed(() =>
  themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
    ? themeStore.getCurrentLightThemeColor
    : themeStore.getCurrentExtraLightThemeColor
);

const count = ref(15);

function handleLoad() {
  count.value += 1;
}
</script>

<style lang="scss" scoped>
.contract-page-container {
  display: flex;
  flex-direction: column;

  .item {
    display: flex;
    align-items: center;
    height: 5rem;
    justify-content: center;
    margin-bottom: 10px;
    background-color: v-bind(currentThemeColor);
  }

  .item:last-child {
    margin-bottom: 0;
  }
}
</style>
