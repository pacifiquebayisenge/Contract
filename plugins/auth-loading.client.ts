export default defineNuxtPlugin((nuxtApp) => {
  const visible = ref(false)

  const authLoading = {
    visible,
    show: () => (visible.value = true),
    hide: () => (visible.value = false),
  }

  nuxtApp.provide("authLoading", authLoading)
})
