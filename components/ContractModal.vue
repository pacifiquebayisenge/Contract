<template>
  <div class="contract-modal">
    <n-avatar
      round
      :size="60"
      :style="{
        color: 'grey',
        backgroundColor: 'lightgray',
      }"
      >{{ name.charAt(0) }}</n-avatar
    >
    <span>Did {{ name }} use <span class="special">contract </span> again ???</span>

    <button class="button-3D button-3D-colorfull-warning" @click="test()">
      Unbelievable !
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
.contract-modal {
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

  .button-3D {
    position: relative;
    padding: 0.75rem 1.5rem;

    font-weight: bolder;
    font-size: 1.4rem !important;

    width: 100%;
    background: #ffffff;
    border: 0.2rem solid #b9baba;
    border-radius: 0.8rem;
    transform: translateY(-0.4rem);
    transition: all 0.1s ease;
    box-shadow: 0 0.4rem 0 #b9baba, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-0.5rem);
      box-shadow: 0 0.5rem 0 #b9baba, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 0 0 #b9baba, 0 0 0 rgba(0, 0, 0, 0.1);
    }

    &,
    &:active,
    &:focus {
      .n-button__border,
      .n-button__state-border {
        border: none !important;
      }
    }

    &-colorfull {
      // Success state with lighter green
      &-success {
        background: #cceada;
        border-color: #aad3bb;
        color: #2c7a4d; // Darker text for contrast
        box-shadow: 0 0.4rem 0 #aad3bb, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

        &:hover {
          color: #fff;
          background-color: #36ad6a;
          box-shadow: 0 0.5rem 0 #aad3bb, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
        }

        &:active {
          color: #fff;
          background-color: #36ad6a;
          box-shadow: 0 0 0 #aad3bb, 0 0 0 rgba(0, 0, 0, 0.1);
        }

        &:focus {
          background: #cceada;
          color: #2c7a4d;
        }
      }

      &-warning {
        background: #ffe5cc; // light orange background
        border-color: #ffb366; // medium orange border
        color: #cc5200; // dark orange text for contrast
        box-shadow: 0 0.4rem 0 #ffb366, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1);

        &:hover {
          color: #fff;
          background-color: #ff8000; // strong orange
          box-shadow: 0 0.5rem 0 #ffb366, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1);
        }

        &:active {
          color: #fff;
          background-color: #e67300; // slightly darker pressed orange
          box-shadow: 0 0 0 #ffb366, 0 0 0 rgba(0, 0, 0, 0.1);
        }

        &:focus {
          background: #ffe5cc;
          color: #cc5200;
        }
      }

      // Error state
      &-error {
        background: #ffd6d6;
        border-color: #ffb3b3;
        color: #d03050;
        box-shadow: 0 0.4rem 0 #ffb3b3, 0 0.4rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 4px and 6px

        &:hover {
          color: #fff;
          background-color: #de576d;
          box-shadow: 0 0.5rem 0 #ffb3b3, 0 0.5rem 0.6rem rgba(0, 0, 0, 0.1); // Converted from 5px and 6px
        }

        &:active {
          color: #fff;
          background-color: #de576d;
          box-shadow: 0 0 0 #ffb3b3, 0 0 0 rgba(0, 0, 0, 0.1);
        }

        &:focus {
          background: #ffd6d6;
          color: #d03050;
        }
      }

      .n-ellipsis {
        line-height: 2rem;

        span {
          font-weight: bold;
        }
      }
    }
  }
}
</style>
