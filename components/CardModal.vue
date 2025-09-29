<template>
  <div>
    <span>Select an action</span>

    <n-collapse default-expanded-names="1" accordion class="py-8">
      <n-collapse-item name="1">
        <template #header> Contract use </template>
        <div>{{ name }} used the word contract ?</div>
      </n-collapse-item>
      <n-collapse-item name="2">
        <template #header> Violation </template>
        <div>{{ name }} did not follow an rule of the contract ?</div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<script setup>
const { name } = defineProps({
  name: {
    type: String,
    default: "Name",
  },
});
</script>

<style lang="scss" scoped></style>
