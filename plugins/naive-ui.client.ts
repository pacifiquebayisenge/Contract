import { defineNuxtPlugin } from '#app'
import {
  create,
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NCollapseTransition,
  NDivider,
  NDrawer,
  NDrawerContent,
  NIcon,
  NImage,
  NInfiniteScroll,
  NInput,
  NModal,
  NModalProvider,
  NProgress,
  NSpace,
  NSpin,
  NSwitch,
  NTabPane,
  NTabs,
  NText,
} from 'naive-ui'
import type { DrawerPlacement } from 'naive-ui'

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
      NDivider,
      NInfiniteScroll,
      NSpin,
      NAlert,
    ],
  })
  nuxtApp.vueApp.use(naive)
})
