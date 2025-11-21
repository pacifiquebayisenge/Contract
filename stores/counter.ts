// stores/count.ts
import { defineStore } from "pinia";

// Number of milliseconds in a day 
const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Helper function to calculate days passed since a given date string
function getDaysPassed(lastDateString: string | null): number {
    if (!lastDateString) {
        return 0;
    }

    const lastDate = new Date(lastDateString);
    const today = new Date();

    // Resets time to midnight for accurate day comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    return Math.floor(diffTime / DAY_IN_MS);
}

export const useCountStore = defineStore("count", {
    state: () => ({
        seenCount: 0,
        streakCount: 0,
        creditCount: 0,
        isSyncDay: false
    }),

    getters: {
        getSeenCount: (state) => state.seenCount,
        getStreakCount: (state) => state.streakCount,
        // Getter returns a formatted string for creditCount
        getCreditCount: (state) =>
            formatCount(state.creditCount)
    },

    actions: {
        setSeenCount(seenCount: number): void {
            this.seenCount = seenCount;
            if (import.meta.client) {
                localStorage.setItem("seen-count", seenCount.toString());
            }
        },

        setStreakCount(streakCount: number): void {
            this.streakCount = streakCount;
            if (import.meta.client) {
                localStorage.setItem("streak-count", streakCount.toString());
            }
        },

        setCreditCount(creditCount: number): void {
            this.creditCount = creditCount;
            if (import.meta.client) {
                localStorage.setItem("credit-count", creditCount.toString());
            }
        },

        updateSeenCount(): void {
            const newSeenCount = this.seenCount + 1;
            this.setSeenCount(newSeenCount);
        },
        updateStreakCount(): void {
            const newStreakCount = this.streakCount + 1;
            this.setStreakCount(newStreakCount);
        },
        updateCreditCountDaily(): void {
            if (!import.meta.client) return;

            const daysPassed = getDaysPassed(localStorage.getItem("last-credit-day"));

            if (daysPassed > 0) {
                // 1. Add credits: 100 for every day passed
                const creditsToAdd = daysPassed * 100;
                this.setCreditCount(this.creditCount + creditsToAdd);

                // 2. Save today as the new last credit day
                // Use a standardized date for consistency
                localStorage.setItem("last-credit-day", new Date().toISOString());
            }

            // Note: If daysPassed is 0 (it's the same day), no action is taken.

        },
        syncDayCheck() {
            if (!import.meta.client) return;

            const daysPassed = getDaysPassed(localStorage.getItem("last-sync-day"));

            this.isSyncDay = daysPassed > 0;

            this.syncToDB(this.isSyncDay)


        },

        syncToDB(isSyncDay: boolean) {

            if (!import.meta.client) return;
            if (!isSyncDay) return

            const savedSeenCount = parseInt(localStorage.getItem("seen-count") || "0");
            const savedStreakCount = parseInt(localStorage.getItem("streak-count") || "0");
            const savedCreditCount = parseInt(localStorage.getItem("credit-count") || "0");

            // http methods

        },

        initializeCounts(): void {
            if (!import.meta.client) return;

            // Load counts from local storage 
            const loadCount = (key: string) => parseInt(localStorage.getItem(key) || "0");

            this.setSeenCount(loadCount("seen-count"));
            this.setStreakCount(loadCount("streak-count"));
            this.setCreditCount(loadCount("credit-count"));

            // IMPORTANT: daily credit check upon initialization
            this.updateCreditCountDaily()

            this.syncDayCheck()

        },
    },
});
