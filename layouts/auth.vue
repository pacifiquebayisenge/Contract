<template>
  <div :style="backgroundStyle" class="auth-layout flex items-center justify-center p-6 relative overflow-hidden">

    <!-- Animated Floating Card -->
    <div ref="cardRef" class="auth-card">
      <slot />
    </div>

  </div>
</template>

<script setup>
import { useThemeStore } from "~/stores/theme"
import anime from "animejs"
import { onMounted, ref, computed } from "vue"

const theme = useThemeStore()

// THEME-BASED ANIMATED GRADIENT BACKGROUND
const backgroundStyle = computed(() => {
  const main = theme.getCurrentThemeColor
  const light = theme.getCurrentLightThemeColor
  const extra = theme.getCurrentExtraLightThemeColor

  return {
    background: `
      linear-gradient(
        135deg,
        ${extra} 0%,
        ${light} 40%,
        ${main} 100%
      )
    `,
    backgroundSize: "180% 180%",
    animation: "gradientMove 12s ease infinite"
  }
})

const cardRef = ref(null)

// ENTRY + SUBTLE FLOAT ANIMATION
onMounted(() => {
    theme.initializeTheme();
  anime({
    targets: cardRef.value,
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 800,
    easing: "easeOutQuad",
  })

  anime({
    targets: cardRef.value,
    translateY: ["+=0", "-=6"],
    direction: "alternate",
    loop: true,
    easing: "easeInOutQuad",
    duration: 3500,
  })
})
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
  border-radius: 1.75rem;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 10;
  height: fit-content;
  animation: fadeIn 0.6s ease-out;
}

/* Mobile breakpoint */
@media (max-width: 640px) {
  .auth-card {
    max-width: 25rem;
  }
}

/* OPTIONAL: subtle fade on mount */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(25px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ANIMATED BACKGROUND */
@keyframes gradientMove {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
