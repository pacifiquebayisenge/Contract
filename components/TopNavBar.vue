<template>
  <div
    class="relative bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap mx-8 hide-scrollbar"
  >
    <div
      ref="tabsContainer"
      class="relative flex px-4 pt-4 pb-1 space-x-6 justify-self-center"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="relative text-sm pb-2"
        @click="setActiveTab(index)"
      >
        <span
          :ref="(el) => (tabRefs[index] = el)"
          class="px-1 transition-colors duration-200 text-base"
          :class="
            activeTab === index
              ? 'text-black font-semibold'
              : 'text-gray-500 hover:text-black'
          "
        >
          {{ tab.name }}
        </span>
      </button>

      <!-- The animated underline -->
      <div
        class="absolute bottom-0 h-0.5 bg-black transition-all duration-300 ease-out"
        :style="{
          width: underlineWidth + 'px',
          transform: `translateX(${underlineLeft}px)`,
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";

const router = useRouter();

const tabs = [
  { name: "Home", path: "/" },
  { name: "Contract", path: "/contract" },
  { name: "P. O. T.", path: "/pot" },
  { name: "Memories", path: "/memories" },
  { name: "Stats", path: "/stats" },
  // add more as needed
];
const activeTab = ref(0);

const tabRefs = [];
const tabsContainer = ref(null);
const tabsContainerXPadding = ref(10);

const underlineLeft = ref(0);
const underlineWidth = ref(0);

const updateUnderline = () => {
  const el = tabRefs[activeTab.value];
  const container = tabsContainer.value;

  if (!el || !container) return;

  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Calculate left relative to container
  underlineLeft.value =
    elRect.left - tabsContainerXPadding.value - containerRect.left + container.scrollLeft;
  underlineWidth.value = elRect.width;
};

const setActiveTab = async (index) => {
  activeTab.value = index;
  await nextTick();
  updateUnderline();

  const path = tabs[index].path;
  router.push(path);
};

onMounted(() => {
  const currentRoute = useRoute();
  const index = tabs.findIndex((tab) => tab.path === currentRoute.path);
  if (index !== -1) {
    activeTab.value = index;
  }

  window.addEventListener("resize", updateUnderline);
  nextTick(updateUnderline);
});

watch(activeTab, updateUnderline);
</script>

<style>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
