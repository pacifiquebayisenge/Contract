// init stores
export default defineNuxtPlugin(() => {
	const themeStore = useThemeStore()
	const contractStore = useContractStore()

	themeStore.init()
	contractStore.init()
})
