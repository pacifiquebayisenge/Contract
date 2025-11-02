// stores/count.ts
import { defineStore } from "pinia";

export const useCountStore = defineStore("count", {
    state: () => ({
        seenCount: 0,
        streakCount: 0,
        creditCount: 0
    }),

    getters: {
        getSeenCount: (state) => state.seenCount,
        getStreakCount: (state) => state.streakCount,
        getCreditCount: (state) => new Intl.NumberFormat("en", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 })
            .format(state.creditCount)
    },

    actions: {
        setSeenCount(seenCount: number): void {
            this.seenCount = seenCount;
            localStorage.setItem("seen-count", seenCount.toString());
        },

        setStreakCount(streakCount: number): void {
            this.streakCount = streakCount;
            localStorage.setItem("streak-count", streakCount.toString());
        },

        _test(creditCount: number): string {
            return new Intl.NumberFormat('en', {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 1
            }).format(creditCount);
        },
        setCreditCount(creditCount: number): void {
            this.creditCount = creditCount;
            localStorage.setItem("credit-count", creditCount.toString());
        },

        updateSeenCount(): void {
            const newSeenCount = this.seenCount + 1;
            this.setSeenCount(newSeenCount);
        },
        updateStreakCount(): void {
            const newStreakCount = this.streakCount + 1;
            this.setStreakCount(newStreakCount);
        },
        updateCreditCount(): void {
            const newCreditCount = this.creditCount + 500;
            this.setCreditCount(newCreditCount);
        },



        initializeCounts(): void {

            if (process.client) {
                const savedSeenCount = parseInt(localStorage.getItem("seen-count") || "0");
                const savedStreakCount = parseInt(localStorage.getItem("streak-count") || "0");
                const savedCreditCount = parseInt(localStorage.getItem("credit-count") || "0");

                this.setSeenCount(isNaN(savedSeenCount) ? 0 : savedSeenCount);
                this.setStreakCount(isNaN(savedStreakCount) ? 0 : savedStreakCount);
                this.setCreditCount(isNaN(savedCreditCount) ? 0 : savedCreditCount);
            }
        },
    },
});
