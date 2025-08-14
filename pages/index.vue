<template>
  <div class="home-container">
    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
  </div>
</template>

<script setup>
import AvatarCard from "~/components/AvatarCard.vue";
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
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
