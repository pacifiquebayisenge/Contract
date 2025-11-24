<template>
  <div class="home-page-container invisible-scroll page-bottom-padding">
    <AvatarCard :profile="userStore.profile" :pseudo="pseudoStore.myPseudo" />
    <AvatarCard :profile="userStore.partnerProfile" :pseudo="pseudoStore.partnerPseudo" />
  </div>
</template>

<script setup>
import AvatarCard from "~/components/AvatarCard.vue";
import { useCountStore } from "~/stores/counter";
import { useUserStore } from "~/stores/user";
import { usePseudoStore } from "~/stores/pseudo";
import { onMounted } from "vue";

const countStore = useCountStore();
const userStore = useUserStore();
const pseudoStore = usePseudoStore();

onMounted(async () => {
  countStore.updateSeenCount();
});
</script>

<style lang="scss" scoped>
.home-page-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;

  div.n-card {
    border-radius: 2rem;

    // max-width: 400px;

    .header {
      display: flex;
      align-content: center;
      gap: 1rem;

      span {
        padding-top: 0.25rem;
        font-weight: 500;
      }
    }
  }
}

.shadow-md {
  border-radius: 2rem;
}
</style>
