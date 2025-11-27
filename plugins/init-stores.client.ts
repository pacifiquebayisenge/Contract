// init stores
export default defineNuxtPlugin(() => {
  const themeStore = useThemeStore()

  themeStore.init()
})
