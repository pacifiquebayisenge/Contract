<template>
  <div>
    <n-card :style="{ borderRadius: '2rem !important' }">
      <div class="avatar-card-content" @click="showActions = !showActions">
        <div class="avatar">
          <!-- <n-avatar
            round
            :size="80"
            :style="{
              color: 'grey',
              backgroundColor: 'lightgray',
              borderRadius: '2rem !important',
            }"
            >{{ title.charAt(0) }}</n-avatar
          > -->
          <div class="avatar-container">
            <n-image
              width="50"
              :src="
                title.charAt(0) === 'S'
                  ? '/memojis/paci/wink.png'
                  : '/memojis/jeje/wink.png'
              "
            />
          </div>
        </div>

        <div class="content">
          <div class="title">
            <span class="text-5xl">{{ title }}</span>
          </div>
          <div class="text">Card Content Y</div>
        </div>
      </div>

      <n-collapse-transition :show="showActions">
        <div class="avatar-card-content-actions pl-40">
          <div class="content">
            <div class="title">
              <span class="font-bold">action's</span>
            </div>
            <div class="action-buttons py-8">
              <button
                class="button-3D button-3D-colorfull-warning"
                @click="showContractDialog = !showContractDialog"
              >
                Contract use
              </button>
              <button
                class="button-3D button-3D-colorfull-error"
                @click="showViolationDialog = !showViolationDialog"
              >
                Violation
              </button>
            </div>
          </div>
        </div>
      </n-collapse-transition>

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

    <n-modal v-model:show="showContractDialog" transform-origin="center">
      <n-card style="max-width: 80%" :bordered="false" size="huge" role="dialog">
        <template #header>
          <span style="font-weight: bold; display: flex; justify-content: center">
            Contract use
          </span>
        </template>

        <ContractModal :name="title" />
      </n-card>
    </n-modal>

    <n-modal v-model:show="showViolationDialog" transform-origin="center">
      <n-card style="width: 80%" :bordered="false" size="huge" role="dialog">
        <span style="font-weight: bold; display: flex; justify-content: center">
          Violation
        </span>
        <ViolationModal :name="title" />
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { EyeIcon, FireIcon } from "@heroicons/vue/24/outline";
import ContractModal from "./ContractModal.vue";
import { useThemeStore } from "~/stores/theme";

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

const themeStore = useThemeStore();

// Computed property for dynamic theme color
const currentThemeColor = computed(() => themeStore.getCurrentLightThemeColor);

// Reactive variable to control dialog visibility
let showActions = ref(false);
let showContractDialog = ref(false);
let showViolationDialog = ref(false);

watch(
  showContractDialog,
  (newValue) => {
    showContractDialog.value = newValue;
  },
  { deep: true }
);
watch(
  showViolationDialog,
  (newValue) => {
    showViolationDialog.value = newValue;
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.avatar-container {
  width: 8rem;
  height: 8rem;
  background-color: v-bind(currentThemeColor);
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-start-end-radius: inherit;

  outline: 2px solid rgba(0, 0, 0, 0.1);
  outline-offset: 3px;

  // outline: 2px solid rgba(0, 0, 0, 0.1);
  // outline-offset: -5px;
}

.avatar-card-content,
.avatar-card-content-actions {
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
}

.avatar-card-content-actions {
  width: 100%;
  justify-content: center;
  .content {
    .title {
      display: flex;
      justify-content: center;
    }
    width: 100%;
    max-width: 30rem;
    .action-buttons {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.6rem;
      width: 100%;
    }
  }
}
</style>
