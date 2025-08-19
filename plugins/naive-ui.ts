import { defineNuxtPlugin } from "#app";
import { create, NButton, NInput, NCard, NAvatar, NIcon, NSpace, NTabs, NTabPane, NModal, NDrawer, NDrawerContent} from "naive-ui";
import type { DrawerPlacement } from 'naive-ui'



export default defineNuxtPlugin((nuxtApp) => {
  const naive = create({
    components: [NButton, NInput, NCard, NAvatar, NIcon, NSpace, NTabs, NTabPane, NModal, NDrawer,NDrawerContent],

  });
  nuxtApp.vueApp.use(naive);
});