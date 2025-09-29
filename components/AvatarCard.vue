<template>
  <div>
    <n-card>
      <div class="avatar-card-content" @click="showDialog = true">
        <div class="avatar">
          <n-avatar
            round
            :size="80"
            :style="{
              color: 'grey',
              backgroundColor: 'lightgray',
            }"
            >{{ title.charAt(0) }}</n-avatar
          >
        </div>

        <div class="content">
          <div class="title">
            <span class="text-5xl">{{ title }}</span>
          </div>
          <div class="text">Card Content Y</div>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-x-4 border-t border-gray-200 pt-2 footer">
          <div class="flex gap-x-1 justify-center items-center">
            <NIcon class="text-base opacity-55" :size="14" :component="EyeIcon" />
            <span class="text-base opacity-55">{{ seenCounter }}</span>
          </div>
          <div class="flex gap-x-1 justify-center items-center">
            <NIcon class="text-base opacity-55" :size="14" :component="FireIcon" />
            <span class="text-base opacity-55">{{ streakCounter }}</span>
          </div>
        </div>
      </template>
    </n-card>

    <!-- <n-modal
      v-model:show="showDialog"
      preset="dialog"
      :title="` ${title}'s action`"
      positive-text="Close"
      class="avatar_modal"
      @positive-click="showDialog = false"
    >
      <CardModal :title="title" />
    </n-modal> -->

    <n-modal v-model:show="showDialog" transform-origin="center">
      <n-card
        style="width: 80%"
        :title="` ${title}'s action`"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <CardModal :name="title" />
      </n-card>
    </n-modal>
  </div>
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

// Reactive variable to control dialog visibility
let showDialog = ref(false);

watch(
  showDialog,
  (newValue) => {
    showDialog.value = newValue;
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
div.avatar-card-content {
  // max-width: 400px;
  display: flex;
  align-content: center;
  gap: 2rem;

  .content {
    margin-top: 1rem;
  }

  span {
    padding-top: 0.25rem;
    font-weight: 500;
  }

  .footer {
  }
}

div.n-dialog.avatar_modal {
  .n-dialog__title i {
    display: none !important;
  }
}
</style>
