<template>
  <n-tabs
    class="mx-8 px-12 flex justify-center themed-tabs"
    type="line"
    animated
    :value="activeTab"
    @update:value="handleTabChange"
  >
    <n-tab-pane
      v-for="(tab, index) in tabs"
      :key="index"
      class="text-gray-700"
      :name="tab.name"
      :tab="tab.name"
      @click="activate('bottom')"
    />
  </n-tabs>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useThemeStore } from "~/stores/theme";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();

const tabs = ref([
  { name: "Home", path: "/" },
  { name: "Contract", path: "/contract" },
  // { name: "P. O. T.", path: "/pot" },
  { name: "Memories", path: "/memories" },
  { name: "Stats", path: "/stats" },
]);

const activeTab = ref(tabs.value[0].name);

// Remove explicit type annotations to avoid ESLint issues
const handleTabChange = (tabName) => {
  const selectedTab = tabs.value.find((tab) => tab.name === tabName);
  if (selectedTab) {
    activeTab.value = tabName;
    router.push(selectedTab.path);
  }
};

onMounted(() => {
  // Set active tab based on current route
  const currentTab = tabs.value.find((tab) => tab.path === route.path);
  if (currentTab) {
    activeTab.value = currentTab.name;
  }
});

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);
</script>

<style lang="scss">
.n-tabs-tab__label {
  font-weight: 700;
}

/* Dynamic theme-based styling */
.themed-tabs .n-tabs-nav-scroll-content .n-tabs-bar {
  border-color: v-bind(currentThemeColor) !important;
}

.themed-tabs .n-tabs-tab__label {
  color: rgb(49, 49, 49);
}

.themed-tabs .n-tabs-tab--active .n-tabs-tab__label {
  color: v-bind(currentThemeColor) !important;
}

.themed-tabs .n-tabs-tab:hover .n-tabs-tab__label {
  color: v-bind(currentThemeColor) !important;
  opacity: 0.8;
}

/* Alternative approach using CSS custom properties */
.themed-tabs {
  width: fit-content;
  --theme-color: v-bind(currentThemeColor);

  .n-tabs-pane-wrapper .n-tab-pane {
    padding-top: 0.6rem;
  }
}

.themed-tabs .n-tabs-bar::after {
  background-color: var(--theme-color) !important;
}

.themed-tabs .n-tabs-nav-scroll-content .n-tabs .n-tabs-bar {
  background-color: var(--theme-color) !important;
}
.themed-tabs .n-tabs-nav-scroll-content .n-tabs-wrapper {
  padding-left: 2rem;
  padding-right: 2rem;
}

.n-tabs .n-tabs-bar {
  background-color: var(--theme-color) !important;
}
</style>
