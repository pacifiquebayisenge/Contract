<template>
  <div class="delete-contract-item-model">
    <span>
      Let's see what we can <span class="special">change</span> about contract rule
      <span class="special">{{ index + 1 }}</span> ???
    </span>

    <input v-model="title" type="text" />

    <textarea v-model="description"></textarea>

    <button
      class="button-3D button-3D-colorfull"
      @click="$emit('update:modelValue', { id: item.id, title, description })"
    >
      <span>Edit</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useThemeStore } from "~/stores/theme";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      id: "",
      title: "",
      description: "",
    }),
  },
  index: {
    type: Number,
    default: 0,
  },
  item: {
    type: Object,
    default: () => ({
      id: "",
      title: "",
      description: "",
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const { item } = props;

// local reactive copies
const title = ref("");
const description = ref("");

// 1️⃣ populate on launch
onMounted(() => {
  title.value = item.title || "";
  description.value = item.description || "";

  // also initialize modelValue immediately
  emit("update:modelValue", { ...item });
});

// 2️⃣ sync back to parent automatically
watch([title, description], ([newTitle, newDescription]) => {
  emit("update:modelValue", {
    id: item.id,
    title: newTitle,
    description: newDescription,
  });
});

const themeStore = useThemeStore();
const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);
</script>

<style lang="scss" scoped>
.delete-contract-item-model {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;

  & > span {
    text-align: center;
  }

  span {
    font-size: 1.6rem;
    font-weight: 500;

    .special {
      color: v-bind(currentThemeColor);
      font-weight: 700;
    }
  }
}
</style>
