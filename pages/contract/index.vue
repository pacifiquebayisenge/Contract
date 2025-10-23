<template>
  <div class="contract-page-container">
    <div class="action-buttons py-8 px-16 mb-8 flex gap-8">
      <button class="button-3D button-3D-colorfull">New</button>
    </div>

    <div class="scroll-container invisible-scroll page-bottom-padding">
      <n-infinite-scroll :distance="10" @load="handleLoad">
        <ContractItem
          v-for="(item, index) in items"
          :key="index"
          :index="index"
          :item="item"
        />
      </n-infinite-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContractItem from "~/components/ContractItem.vue";
import { useThemeStore } from "~/stores/theme";

const themeStore = useThemeStore();

// Computed property for dynamic theme color
const currentThemeColor = computed(() =>
  themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
    ? themeStore.getCurrentLightThemeColor
    : themeStore.getCurrentExtraLightThemeColor
);

// const count = ref(15);

function handleLoad() {
  // count.value += 1;
}

const items = [
  {
    id: "1",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "2",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "3",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "4",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "5",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "6",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "7",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "8",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "9",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "10",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "11",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "12",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "13",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "14",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
  {
    id: "15",
    title: "contract rule title",
    description: "Description of the contract rule",
  },
];
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
