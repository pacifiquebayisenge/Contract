<template>
  <div class="bottom-menu-bar  ">
    <div class="items flex space-between justify-center ">
      <div class="item">
        <div class="icon">
        <NIcon class="text-base opacity-55" :size="35" :component="UserIcon"/>
        </div>

        <!-- <div class="label">Profile</div> -->
      </div>
      <div class="item">
        <div class="icon">
        <NIcon class="text-base opacity-55" :size="35" :component="InboxIcon"/>
        </div>

        <!-- <div class="label">Inbox</div> -->
      </div>
      <div class="item">
        <div class="icon">
        <NIcon class="text-base opacity-55" :size="35" :component="Cog6ToothIcon"/>
        </div>

        <!-- <div class="label">Settings</div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon ,InboxIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";

</script>

<style lang="scss">
.bottom-menu-bar {
  background-color: cornflowerblue;
  padding: 0.5rem 1.5rem;
  background-color: #fafafa;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
backdrop-filter: blur(3px);
  background-color: rgba(255, 255, 255, 0.80);

 border-radius: 2rem;

  .items {
    gap: 4rem;

    .item {
        cursor: pointer;

        .icon {
            margin: 1rem;
        }
    }
  }
}
</style>

