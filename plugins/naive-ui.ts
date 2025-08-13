import { defineNuxtPlugin } from "#app";
import { create, NButton, NInput, NCard, NAvatar, NIcon, NSpace} from "naive-ui";



export default defineNuxtPlugin((nuxtApp) => {
  const naive = create({
    components: [NButton, NInput, NCard, NAvatar, NIcon, NSpace],
  });
  nuxtApp.vueApp.use(naive);
});