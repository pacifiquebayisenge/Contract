import { defineNuxtPlugin } from "#app";
import {
  create,
  NButton,
  NInput,
  NCard,
  NAvatar,
  NIcon,
  NSpace,
  NTabs,
  NTabPane,
  NModal,
  NDrawer,
  NDrawerContent,
  NCollapse,
  NCollapseItem,
  NModalProvider,
  NCollapseTransition,
  NText,
  NProgress,
  NImage,
  NSwitch,
  NDivider
} from "naive-ui";
import type { DrawerPlacement } from "naive-ui";

export default defineNuxtPlugin((nuxtApp) => {
  const naive = create({
    components: [
      NButton,
      NInput,
      NCard,
      NAvatar,
      NIcon,
      NSpace,
      NTabs,
      NTabPane,
      NModal,
      NDrawer,
      NDrawerContent,
      NCollapse,
      NCollapseItem,
      NModalProvider,
      NCollapseTransition,
      NText,
      NProgress,
      NImage,
      NSwitch,
      NDivider
    ],
  });
  nuxtApp.vueApp.use(naive);
});
