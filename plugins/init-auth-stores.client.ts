// auth related stores
export default defineNuxtPlugin(() => {
    const authUser = useSupabaseUser();
    const userStore = useUserStore();
    const pseudoStore = usePseudoStore();

    watch(
        authUser,
        (u) => {
            if (u && u.sub) {
                // Avoid double initialization
                if (!userStore.ready) userStore.init();
                if (!pseudoStore.ready) pseudoStore.init();

            }
        },
        { immediate: true }
    );
});
