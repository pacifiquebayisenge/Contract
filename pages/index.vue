<template>
  <div class="home-container">
    <AvatarCard title="Domme" />
    <AvatarCard title="Sukkel" />
  </div>
</template>

<script setup>
import AvatarCard from "~/components/AvatarCard.vue";
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  gap: 3rem;

  div.n-card {
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
</style>
