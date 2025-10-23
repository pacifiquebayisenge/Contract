<template>
  <div class="delete-contract-item-model">
    <span
      >Are you <span class="special">sure </span> you want to delete contract rule
      <span class="special">{{ index + 1 }} </span> ???</span
    >

    <span>{{ item.title }}</span>

    <button
      class="button-3D button-3D-colorfull-error"
      @click="showDeleteDialog = !showDeleteDialog"
    >
      Delete
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from "~/stores/theme";

const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  item: {
    type: Object,
    default: () => ({
      id: undefined,
      title: undefined,
      description: undefined,
    }),
  },
});

const { item, index } = props;

const themeStore = useThemeStore();

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);
</script>

<style lang="scss" scoped>
.delete-contract-item-model {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;

  & > span {
    text-align: center;
  }

  span {
    font-size: 1.6rem;
    font-weight: 500;

    .special {
      color: v-bind(currentThemeColor);
      font-weight: 700;
    }
  }
}
</style>
