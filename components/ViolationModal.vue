<template>
  <div class="violation-modal">
    <n-avatar
      round
      :size="60"
      :style="{
        color: 'grey',
        backgroundColor: 'lightgray',
      }"
      >{{ name.charAt(0) }}</n-avatar
    >
    <span
      >Did {{ name }} violate a <span class="special">contract rule</span> again ???</span
    >

    <button class="button-3D button-3D-colorfull-error" @click="test()">
      Shamefull !
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from "~/stores/theme";

const { name } = defineProps({
  name: {
    type: String,
    default: "Name",
  },
});

const themeStore = useThemeStore();

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);

const test = () => {
  console.log("vibrate");
  navigator.vibrate([100, 200, 200, 200, 500]);
};
</script>

<style lang="scss" scoped>
.violation-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  .n-card-header .n-card-header__main {
    text-align: center !important;
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
