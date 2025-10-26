<template>
  <div
    ref="card"
    :style="{ borderRadius: '1rem !important', cursor: 'pointer' }"
    class="shadow-md my-8"
  >
    <n-card :style="{ borderRadius: '1rem !important' }">
      <!-- ... rest of your template stays EXACTLY the same ... -->
      <div class="contract-item-content" @click="showActions = !showActions">
        <div class="index">
          <span class="text-2xl">{{ index + 1 }}</span>
        </div>
        <div class="text">{{ item.title }}</div>
      </div>

      <n-collapse-transition :show="showActions">
        <div class="contract-item-content-actions mt-5">
          <div class="content">
            <textarea
              readonly
              class="contract-description w-[100%] h-[15rem] bg-[#0000000a] py-4 px-6 rounded-[1rem]"
              :name="'contract-rule-description-' + index"
              :value="item.description"
            >
            </textarea>

            <div class="action-buttons py-8">
              <button
                class="button-3D button-3D-colorfull"
                @click="showEditDialog = !showEditDialog"
              >
                <NIcon
                  class="text-base opacity-55"
                  :size="20"
                  :component="PencilSquareIcon"
                />
              </button>

              <button
                class="button-3D button-3D-colorfull-error"
                @click="showDeleteDialog = !showDeleteDialog"
              >
                <NIcon class="text-base opacity-55" :size="20" :component="TrashIcon" />
              </button>
            </div>
          </div>
        </div>
      </n-collapse-transition>

      <template #footer>
        <div class="flex gap-x-4 border-t border-gray-200 pt-2 footer">
          <div class="flex gap-x-1 justify-center items-center">
            <span>{{ formattedDate }} : {{ index % 2 ? "Sukkel" : "Domme" }} </span>
          </div>
        </div>
      </template>
    </n-card>

    <n-modal v-model:show="showEditDialog" :auto-focus="false" transform-origin="center">
      <n-card
        style="max-width: 80%"
        :style="{ borderRadius: '1rem !important' }"
        :bordered="false"
        size="huge"
        role="dialog"
      >
        <!-- // TODO change this to userbased icon -->
        <div class="avatar-container py-8">
          <div
            class="avatar"
            :style="{ backgroundColor: currentLightThemeColor }"
            :class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
          >
            <div class="avatar-image">
              <n-image width="50" src="/memojis/jeje/thinking.png" />
            </div>
          </div>
        </div>

        <EditContractItem :item="item" />
      </n-card>
    </n-modal>

    <n-modal v-model:show="showDeleteDialog" transform-origin="center">
      <n-card
        style="width: 80%"
        :style="{ borderRadius: '1rem !important' }"
        :bordered="false"
        size="huge"
        role="dialog"
      >
        <!-- // TODO change this to userbased icon -->
        <div class="avatar-container py-8">
          <div
            class="avatar"
            :style="{ backgroundColor: currentLightThemeColor }"
            :class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
          >
            <div class="avatar-image">
              <n-image width="50" src="/memojis/paci/shook.png" />
            </div>
          </div>
        </div>

        <DeleteContractItem :item="item" />
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from "~/stores/theme";
import { ref, computed } from "vue";

import { TrashIcon, PencilSquareIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  item: {
    type: Object,
    default: () => ({
      id: undefined,
      title: undefined,
      description: undefined,
    }),
  },
});

const { item, index } = props;

const themeStore = useThemeStore();

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);

const currentLightThemeColor = computed(() =>
  themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
    ? themeStore.getCurrentLightThemeColor
    : themeStore.getCurrentExtraLightThemeColor
);

const insideBadgeRing = computed(
  () => themeStore.currentBadgeRingOption === themeStore.badgeRingOptions[0]
);

let showActions = ref(false);
let showEditDialog = ref(false);
let showDeleteDialog = ref(false);

const now = new Date();

const parts = now
  .toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  .split(" ");

const formattedDate = `${parts[0]}, ${parts.slice(1).join(" ")}`;
</script>

<style lang="scss" scoped>
.avatar-container {
  display: flex;
  justify-content: center;

  .avatar {
    width: 8rem;
    height: 8rem;
    background-color: v-bind(currentLightThemeColor);
    border-radius: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;

    &.outside-ring {
      outline: 2px solid rgba(0, 0, 0, 0.1);
      outline-offset: 3px;
    }
    &.inside-ring {
      outline: 2px solid rgba(0, 0, 0, 0.1);
      outline-offset: -5px;
    }
  }
}

.contract-item-content {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
  justify-content: center;
  align-items: center;
  gap: 2rem;

  .index {
    font-weight: 600;
    color: v-bind(currentThemeColor);
  }

  .text {
    font-weight: 600;
    font-size: 1.6rem;
    color: #535353;
  }
}

.contract-item-content-actions {
  display: flex;
  align-content: center;
  gap: 2rem;
  width: 100%;
  justify-content: center;

  span {
    padding-top: 0.25rem;
    font-weight: 500;
  }

  .content {
    margin-top: 1rem;

    .contract-description {
      resize: none;

      &:focus {
        outline: 2px solid v-bind(currentLightThemeColor);
        border-color: v-bind(currentLightThemeColor);
      }
    }

    width: 100%;
    max-width: 50rem;

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 5rem;
      width: 100%;

      button {
        width: 70%;
      }
    }
  }
}

.footer div {
  span {
    font-weight: 600;
    color: #b5b5b5;
  }
}
</style>
