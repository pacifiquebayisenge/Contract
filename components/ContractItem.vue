<template>
  <div ref="card" :style="{ borderRadius: '1rem !important' }" class="shadow-md my-8">
    <n-card :style="{ borderRadius: '1rem !important' }">
      <!-- ... rest of your template stays EXACTLY the same ... -->
      <div class="contract-item-content" @click="showActions = !showActions">
        <div class="index">
          <span class="text-2xl">{{ index }}</span>
        </div>
        <div class="text">Card Content Y</div>
      </div>

      <n-collapse-transition :show="showActions">
        <div class="contract-item-content-actions">
          <div class="content">
            <textarea
              readonly
              class="contract-description w-[100%] h-[15rem] bg-[#0000000a] py-4 px-6 rounded-[1rem]"
              :name="'contract-rule-description-' + index"
            >
Description of the contract rule
            </textarea>

            <div class="action-buttons py-8">
              <button
                class="button-3D button-3D-colorfull"
                @click="showContractDialog = !showContractDialog"
              >
                Edit
              </button>
              <button
                class="button-3D button-3D-colorfull-error"
                @click="showViolationDialog = !showViolationDialog"
              >
                Delete
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

    <n-modal v-model:show="showContractDialog" transform-origin="center">
      <n-card style="max-width: 80%" :bordered="false" size="huge" role="dialog">
        <template #header>
          <span style="font-weight: bold; display: flex; justify-content: center">
            edit
          </span>
        </template>

        <!-- <ContractModal :name="index" /> -->
      </n-card>
    </n-modal>

    <n-modal v-model:show="showViolationDialog" transform-origin="center">
      <n-card style="width: 80%" :bordered="false" size="huge" role="dialog">
        <span style="font-weight: bold; display: flex; justify-content: center">
          Dete
        </span>
        <!-- <ViolationModal :name="index" /> -->
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import ContractModal from "./ContractModal.vue";
import { useThemeStore } from "~/stores/theme";
import { ref, computed } from "vue";

const { index } = defineProps({
  index: { type: Number, default: 0 },
});

const themeStore = useThemeStore();

const currentThemeColor = computed(
  () =>
    //   themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
    //     ? themeStore.getCurrentLightThemeColor
    //     : themeStore.getCurrentExtraLightThemeColor

    themeStore.getCurrentThemeColor
);

let showActions = ref(false);
let showContractDialog = ref(false);
let showViolationDialog = ref(false);

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
    }
    width: 100%;
    max-width: 30rem;
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 1.6rem;
      width: 100%;
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
