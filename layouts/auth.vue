<template>
  <div
    :style="backgroundStyle"
    class="auth-layout flex items-center justify-center p-6 relative overflow-hidden"
  >
    <!-- Animated Floating Card -->
    <div ref="cardRef" class="auth-card">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from "~/stores/theme";
import anime from "animejs";
import { onMounted, ref, computed } from "vue";

const theme = useThemeStore();

// THEME-BASED ANIMATED GRADIENT BACKGROUND
const backgroundStyle = computed(() => {
  const main = theme.getCurrentThemeColor;
  const light = theme.getCurrentLightThemeColor;
  const extra = theme.getCurrentExtraLightThemeColor;

  return {
    background: `
      linear-gradient(
        180deg,
        ${main} 0%,
        ${light} 60%,
        ${extra} 100%
      )
    `,
    backgroundSize: "100% 200%",
  };
});

const cardRef = ref(null);

// ENTRY + SUBTLE FLOAT ANIMATION
onMounted(() => {
  anime({
    targets: cardRef.value,
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 800,
    easing: "easeOutQuad",
  });

  anime({
    targets: cardRef.value,
    translateY: ["+=0", "-=6"],
    direction: "alternate",
    loop: true,
    easing: "easeInOutQuad",
    duration: 3500,
  });
});
</script>

<style scoped>
/* FULLSCREEN AUTH BACKGROUND */
.auth-layout {
  height: 100vh;
  width: 100%;
  position: relative;
}

/* ANIMATED CARD */
.auth-card {
  width: 100%;
  max-width: 85rem;
  padding: 1.5rem 1.8rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(22px);
  border-radius: 2rem;
  position: relative;

  /* FIX: ensure ripple appears behind card */
  z-index: 0;
}

/* Mobile breakpoint */
@media (max-width: 640px) {
  .auth-card {
    max-width: 30rem;
  }
}
</style>
