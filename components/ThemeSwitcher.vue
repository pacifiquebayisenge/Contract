<!-- components/ThemeSwitcher.vue -->
<template>
  <div class="theme-switcher justify-center py-5">
    <button
      v-for="themeOption in themeStore.themes"
      :key="themeOption"
      :class="{ active: themeStore.currentTheme === themeOption }"
      :style="{ backgroundColor: themeStore.getThemeColor(themeOption) }"
      @click="themeStore.setTheme(themeOption)"
    >
      {{ themeOption.replace('-', ' ') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/theme'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 10px;
}
button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  text-transform: capitalize;
}
button.active {
  opacity: 0.7;
}
</style>