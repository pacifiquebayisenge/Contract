// init stores
export default defineNuxtPlugin(() => {
    const themeStore = useThemeStore()
    const countStore = useCountStore()



    themeStore.init();
    countStore.init()
});
