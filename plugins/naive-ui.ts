import { defineNuxtPlugin } from "#app";
import { create, NButton, NInput, NCard, NAvatar, NIcon, NSpace, NTabs, NTabPane} from "naive-ui";



export default defineNuxtPlugin((nuxtApp) => {
  const naive = create({
    components: [NButton, NInput, NCard, NAvatar, NIcon, NSpace, NTabs, NTabPane],
  });
  nuxtApp.vueApp.use(naive);
});