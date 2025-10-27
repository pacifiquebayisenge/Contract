<template>
  <div ref="card" class="shadow-md">
    <n-card :style="{ borderRadius: '2rem !important' }">
      <div class="avatar-card-content" @click="showActions = !showActions">
        <div ref="avatar" class="avatar">
          <div
            ref="avatarBg"
            class="avatar-container"
            :class="insideBadgeRing ? 'inside-ring' : 'outside-ring'"
          >
            <div ref="avatarImg" class="avatar-image">
              <n-image
                width="50"
                :src="title.charAt(0) === 'S' ? paciAvatar : jejeAvatar"
              />
            </div>
          </div>
        </div>

        <div ref="content" class="content">
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
            <span class="text-base opacity-55">{{ countStore.getSeenCount }}</span>
          </div>
          <div class="flex gap-x-1 justify-center items-center">
            <NIcon class="text-base opacity-55" :size="14" :component="FireIcon" />
            <span class="text-base opacity-55">{{ countStore.getStreakCount }}</span>
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

<script setup lang="ts">
import { EyeIcon, FireIcon } from "@heroicons/vue/24/outline";
import ContractModal from "./ContractModal.vue";
import { useThemeStore } from "~/stores/theme";
import { useCountStore } from "~/stores/counter";
import { onMounted, ref, computed } from "vue";

const { title } = defineProps({
  title: { type: String, default: "Name" },
});

const themeStore = useThemeStore();
const countStore = useCountStore();

const currentLightThemeColor = computed(() =>
  themeStore.currentLightThemeOption === themeStore.lightThemeOptions[0]
    ? themeStore.getCurrentLightThemeColor
    : themeStore.getCurrentExtraLightThemeColor
);
const insideBadgeRing = computed(
  () => themeStore.currentBadgeRingOption === themeStore.badgeRingOptions[0]
);

let showActions = ref(false);
let showContractDialog = ref(false);
let showViolationDialog = ref(false);

const memojiNames = [
  "angry.png",
  "cloudy.png",
  "cringe.png",
  "dizzy.png",
  "eye-roll.png",
  "goofy.png",
  "happy.png",
  "heart-eyes.png",
  "idea.png",
  "irritated.png",
  "kiss.png",
  "love.png",
  "lucky.png",
  "mad.png",
  "mindblown.png",
  "party.png",
  "sad.png",
  "shook.png",
  "sleepy.png",
  "star-eyes.png",
  "tear-drop.png",
  "tears-laughing.png",
  "thinking.png",
  "whisper.png",
  "wink.png",
];

const jejeImgs = memojiNames.map((name) => `/memojis/jeje/${name}`);
const paciImgs = memojiNames.map((name) => `/memojis/paci/${name}`);

const paciAvatar = ref("");
const jejeAvatar = ref("");

// ---- NEW REFS for precise animation control ----
const { $anime } = useNuxtApp();
const card = ref(null);
const avatarBg = ref(null); // Avatar background
const avatarImg = ref(null); // Avatar image
const content = ref(null);

onMounted(() => {
  countStore.initializeCounts();
  countStore.updateSeenCount();

  const randomIndex = Math.floor(Math.random() * paciImgs.length);
  paciAvatar.value = paciImgs[randomIndex];

  const randomIndex2 = Math.floor(Math.random() * jejeImgs.length);
  jejeAvatar.value = jejeImgs[randomIndex2];

  if (!card.value || !avatarBg.value || !avatarImg.value || !content.value) return;

  $anime
    .timeline({
      easing: "easeOutElastic(1, .8)",
      duration: 3000,
    })
    // 1️⃣ START: Card is small square (CSS handles initial state)

    // 2️⃣ Avatar BACKGROUND pops up (scale from 0 to 1)
    .add({
      targets: avatarBg.value,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      easing: "easeOutBack(1.7)",
    })

    // 3️⃣ Avatar PICTURE appears (delayed, scales in)
    .add(
      {
        targets: avatarImg.value,
        scale: [0.5, 1],
        opacity: [0, 1],
        duration: 600,
        easing: "easeOutElastic(1, .8)",
      },
      "+=100"
    ) // Start 100ms after background finishes
    .add({
      targets: content.value,
      opacity: [0, 1],
      display: ["none", "block"],
      translateY: [20, 0],
      duration: 700,
      easing: "easeOutQuad",
    });
});
</script>

<style lang="scss" scoped>
.avatar-container {
  width: 8rem;
  height: 8rem;
  background-color: v-bind(currentLightThemeColor);
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-start-end-radius: inherit;

  &.outside-ring {
    outline: 2px solid rgba(0, 0, 0, 0.1);
    outline-offset: 3px;
  }
  &.inside-ring {
    outline: 2px solid rgba(0, 0, 0, 0.1);
    outline-offset: -5px;
  }
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
