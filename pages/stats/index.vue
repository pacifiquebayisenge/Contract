<template>
  <div class="stats-page-container">
    <div class="content">
      <div class="avatar-container py-8">
        <div class="avatar-image mirror">
          <n-image
            style="transform: rotate(5deg) scaleX(-1)"
            width="80"
            src="/memojis/jeje/thinking.png"
          />
        </div>

        <div class="avatar-image">
          <n-image
            style="transform: rotate(3deg)"
            width="81"
            src="/memojis/paci/thinking.png"
          />
        </div>
      </div>
      <p class="title">Please wait ...</p>
      <p class="comm">Not enough <strong class="special"> data </strong> yet</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useThemeStore } from "~/stores/theme";

const themeStore = useThemeStore();

const currentLightThemeColor = computed(() =>
  themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
    ? themeStore.getCurrentLightThemeColor
    : themeStore.getCurrentExtraLightThemeColor
);
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);
</script>

<style lang="scss" scoped>
.stats-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding-bottom: 25rem;

  .avatar-container {
    display: flex;
    gap: 3rem;
    position: relative;

    /* Floor surface */
    &::before {
      content: "";
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 132%;
      height: 41px;
      background: v-bind(currentLightThemeColor);
      border-radius: 50%;
      filter: blur(4px);
      opacity: 0.6;
    }

    .avatar-image {
      position: relative;
      animation: float 3.5s ease-in-out infinite;

      img {
        display: block;
      }
      transform: rotate(5deg) scaleX(-1);

      &.mirror .n-image img {
        transform: rotate(5deg) scaleX(-1) !important;
      }

      /* Shadow on floor */
      &::after {
        content: "";
        position: absolute;
        bottom: -3rem; /* anchored to floor */
        left: 50%;
        transform: translateX(-50%);
        width: 70%;
        height: 10px;
        background: rgba(0, 0, 0, 0.35);
        border-radius: 50%;
        filter: blur(4px);
        opacity: 0.6;
        animation: puddle 3.5s ease-in-out infinite;
      }
    }
  }

  .title {
    text-align: center;
    margin-top: 5rem;
    font-size: 2rem;
    font-weight: 600;
  }

  .comm {
    text-align: center;
    text-align: center;
    font-weight: 500;
    margin-top: 1rem;

    .special {
      color: v-bind(currentThemeColor);
    }
  }
}

/* Floating bounce */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Subtle puddle breathing effect */
@keyframes puddle {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) scale(1.1);
    opacity: 0.45;
  }
}
</style>
