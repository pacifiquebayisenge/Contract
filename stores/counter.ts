// stores/count.ts
import { defineStore } from "pinia";

export const useCountStore = defineStore("count", {
    state: () => ({
        seenCount: 0,
        streakCount: 0,
    }),

    getters: {
        getSeenCount: (state) => state.seenCount,
        getStreakCount: (state) => state.streakCount,
    },

    actions: {
        setSeenCount(seenCount: number): void {
            console.log('set')

            this.seenCount = seenCount;
            localStorage.setItem("seen-count", seenCount.toString());
        },

        updateSeenCount(): void {
            console.log('update')
            const newSeenCount = this.seenCount + 1;
            this.setSeenCount(newSeenCount);
        },

        setStreakCount(streakCount: number): void {
            this.streakCount = streakCount;
            localStorage.setItem("streak-count", streakCount.toString());
        },

        initializeCounts(): void {

            if (process.client) {
                const savedSeenCount = parseInt(localStorage.getItem("seen-count") || "0");
                const savedStreakCount = parseInt(localStorage.getItem("streak-count") || "0");



                this.setSeenCount(isNaN(savedSeenCount) ? 0 : savedSeenCount);
                this.setStreakCount(isNaN(savedStreakCount) ? 0 : savedStreakCount);
            }
        },
    },
});
