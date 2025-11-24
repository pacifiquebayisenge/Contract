import { defineStore } from "pinia";
import type { Database } from "~/types/supabase.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export const useUserStore = defineStore("userStore", {
    state: () => ({
        userId: null as string | null,
        profile: null as ProfileRow | null,
        partnerProfile: null as ProfileRow | null,

        ready: false
    }),

    actions: {
        async init() {
            const supabase = useSupabaseClient<Database>();
            const authUser = useSupabaseUser();

            if (!authUser.value) return;

            // YOUR ID
            this.userId = authUser.value.sub;

            // Load your profile
            const { data: myProfile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", this.userId)
                .single();

            if (myProfile) {
                this.profile = myProfile;
            }

            // Load both profiles (2 total)
            const { data: profiles } = await supabase
                .from("profiles")
                .select("*");

            if (!profiles) return;

            // Find your partner
            this.partnerProfile = profiles.find(p => p.id !== this.userId) ?? null;



            this.ready = true;
        },

        async updateProfile(firstname: string, lastname: string) {
            console.log(firstname)
            if (!this.userId) return;

            const supabase = useSupabaseClient<Database>();

            const { data, error } = await supabase
                .from("profiles")
                .update({
                    firstname,
                    lastname
                })
                .eq("id", this.userId)
                .select("*")
                .single();

            if (!error && data) {
                this.profile = data; // update local state
            }
        }
    }
});
