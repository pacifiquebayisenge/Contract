<!-- components/ThemeSwitcher.vue -->
<template>
  <div class="badge-switcher justify-center py-5">
    <span>badge ring</span>
    <div>
      <n-switch
        v-model:value="badgeRingActive"
        @update:value="handleBadgeRing"
        :rail-style="badgeRingSwitchStyle"
        size="large"
        :style="{
          '--n-text-color': '#484444c7',
        }"
      >
        <template #checked> inside </template>
        <template #unchecked> outside </template>
      </n-switch>
    </div>

    <span>color</span>
    <div>
      <n-switch
        v-model:value="lightThemeActive"
        @update:value="handleLightTheme"
        :rail-style="lightThemeSwitchStyle"
        size="large"
        :style="{
          '--n-text-color': '#484444c7',
        }"
      >
        <template #checked> Extra light </template>
        <template #unchecked> light </template>
      </n-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useThemeStore } from "~/stores/theme";
import type { CSSProperties } from "vue";

const themeStore = useThemeStore();

const lightThemeActive = ref(false);
const badgeRingActive = ref(false);

onMounted(() => {
  console.log(themeStore.currentBadgeRingOption);
  themeStore.initializeTheme();
});

const handleBadgeRing = (value: boolean) => {
  const badgeRingOption = value
    ? themeStore.badgeRingOptions[0]
    : themeStore.badgeRingOptions[1];

  themeStore.setBadgeRingOption(badgeRingOption);
};

const handleLightTheme = (value: boolean) => {
  const themeOption = value
    ? themeStore.lightThemeOptions[0]
    : themeStore.lightThemeOptions[1];

  themeStore.setLightThemeOption(themeOption);
};

const lightThemeSwitchStyle = ({
  focused,
  checked,
}: {
  focused: boolean;
  checked: boolean;
}) => {
  const style: CSSProperties = {};

  if (checked) {
    style.background = themeStore.getCurrentExtraLightThemeColor;
    style.fontWeight = 700;

    if (focused) {
      style.boxShadow = themeStore.getCurrentExtraLightThemeBoxShadow;
    }
  } else {
    style.background = themeStore.getCurrentLightThemeColor;
    style.fontWeight = 700;

    if (focused) {
      style.boxShadow = themeStore.getCurrentLightThemeBoxShadow;
    }
  }

  return style;
};

const badgeRingSwitchStyle = ({
  focused,
  checked,
}: {
  focused: boolean;
  checked: boolean;
}) => {
  const style: CSSProperties = {};

  if (checked) {
    style.background =
      themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
        ? themeStore.getCurrentLightThemeColor
        : themeStore.getCurrentExtraLightThemeColor;
    style.fontWeight = 700;

    if (focused) {
      style.boxShadow =
        themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
          ? themeStore.getCurrentLightThemeBoxShadow
          : themeStore.getCurrentExtraLightThemeBoxShadow;
    }
  } else {
    style.background = adjustColor(
      themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
        ? themeStore.getCurrentLightThemeColor
        : themeStore.getCurrentExtraLightThemeColor,
      -40
    );
    style.fontWeight = 700;

    if (focused) {
      style.boxShadow = adjustColor(
        themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
          ? themeStore.getCurrentLightThemeBoxShadow
          : themeStore.getCurrentExtraLightThemeBoxShadow,
        -40
      );
    }
  }

  return style;
};

const adjustColor = (color: string, amount: number) => {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
</script>

<style scoped>
.badge-switcher {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
