<template>
  <n-card class="avatar-card-container">
    <div class="header">
      <n-avatar
        round
        size="small"
        :style="{
          color: 'grey',
          backgroundColor: 'lightgray',
        }"
        >{{ title.charAt(0) }}</n-avatar
      >
      <span>{{ title }}</span>
    </div>
    Card Content X

    <template #footer>
      <div class="flex gap-x-4 border-t border-gray-200 pt-2 footer">
        <div class="flex gap-x-1 justify-center items-center">
          <NIcon class="text-base opacity-55" :size="14" :component="EyeIcon"></NIcon>
          <span class="text-base opacity-55">{{ seenCounter }}</span>
        </div>
        <div class="flex gap-x-1 justify-center items-center">
          <NIcon class="text-base opacity-55" :size="14" :component="FireIcon"></NIcon>
          <span class="text-base opacity-55">{{ streakCounter }}</span>
        </div>
      </div>
    </template>
  </n-card>
</template>

<script setup>
import { EyeIcon, FireIcon } from "@heroicons/vue/24/outline";

const { title, seenCounter, streakCounter } = defineProps({
  title: {
    type: String,
    default: "Name",
  },
  seenCounter: {
    type: Number,
    default: 0,
  },
  streakCounter: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss" scoped>
div.avatar-card-container {
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

  .footer {
  }
}
</style>
