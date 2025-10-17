<template>
  <div class="home-page-container invisible-scroll page-bottom-padding">
    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />

    <AvatarCard title="Domme" class="shadow-md" />
    <AvatarCard title="Sukkel" class="shadow-md" />
  </div>
</template>

<script setup>
import AvatarCard from "~/components/AvatarCard.vue";
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
