<template>
  <div>
    <div class="bottom-menu-bar">
      <div class="items flex space-between justify-center">
        <div class="item" @click="activateAccountDrawer()">
          <div class="icon">
            <NIcon class="text-base opacity-55" :size="35" :component="UserIcon" />
          </div>
          <!-- <div class="label">Profile</div> -->
        </div>
        <div class="item">
          <div class="icon">
            <NIcon class="text-base opacity-55" :size="35" :component="InboxIcon" />
          </div>
          <!-- <div class="label">Inbox</div> -->
        </div>
        <div class="item" @click="activateSettingsDrawer()">
          <div class="icon">
            <NIcon class="text-base opacity-55" :size="35" :component="Cog6ToothIcon" />
          </div>
          <!-- <div class="label">Settings</div> -->
        </div>
      </div>
    </div>

    <!-- account drawer -->
    <n-drawer
      v-model:show="showAccount"
      :height="500"
      placement="bottom"
      :auto-focus="false"
      style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
    >
      <n-drawer-content title="Account">
        <div>
          <div class="account-items px-5 mb-16">
            <n-input
              v-model:value="inputValue.firstname"
              class="bg-[#0000000a] rounded-[1rem] my-5"
              type="text"
              placeholder="Firstname"
            />

            <n-input
              v-model:value="inputValue.lastname"
              class="bg-[#0000000a] rounded-[1rem] my-5"
              type="text"
              placeholder="Lastname"
            />

            <n-input
              v-model:value="inputValue.partnerPseudo"
              class="bg-[#0000000a] rounded-[1rem] my-5"
              type="text"
              placeholder="Partner Pseudo"
            />

            <button class="button-3D button-3D-colorfull my-6" @click="saveChanges">
              Save
            </button>

            <button class="button-3D button-3D-colorfull-error my-6" @click="logout">
              Logout
            </button>
          </div>

          <!-- <div class="mt-4">
          <n-button @click="active = false" type="primary">
            Close Drawer
          </n-button>
        </div> -->
        </div>
      </n-drawer-content>
    </n-drawer>

    <!-- settings drawer -->
    <n-drawer
      v-model:show="showSettings"
      :height="400"
      placement="bottom"
      style="border-top-left-radius: 2rem; border-top-right-radius: 2rem"
    >
      <n-drawer-content title="Settings">
        <div>
          <div class="settings-items px-5">
            <n-collapse arrow-placement="right">
              <n-collapse-item title="Theme" name="1">
                <div class="px-3">
                  <span>Primary</span>
                  <ThemeSwitcher />

                  <n-divider />

                  <span>Badge</span>
                  <BadgeSwitcher />

                  <n-divider />
                </div>
              </n-collapse-item>
              <!-- <n-collapse-item title="right" name="2">
              <div>nice</div>
            </n-collapse-item>
            <n-collapse-item title="right" name="3">
              <div>very good</div>
            </n-collapse-item> -->
            </n-collapse>
          </div>

          <!-- <div class="mt-4">
          <n-button @click="active = false" type="primary">
            Close Drawer
          </n-button>
        </div> -->
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UserIcon, InboxIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { useThemeStore } from "~/stores/theme";
import { useUserStore } from "~/stores/user";
import { usePseudoStore } from "~/stores/pseudo";

const themeStore = useThemeStore();
const userStore = useUserStore();
const pseudoStore = usePseudoStore();

const currentThemeColor = computed(() => themeStore.getCurrentThemeColor);

const showSettings = ref(false);
const showAccount = ref(false);

const inputValue = reactive({
  firstname: "",
  lastname: "",
  partnerPseudo: "",
});

const originalValues = reactive({
  firstname: "",
  lastname: "",
  partnerPseudo: "",
});

const activateSettingsDrawer = () => {
  showSettings.value = true;
};

const activateAccountDrawer = () => {
  showAccount.value = true;
  // Load values from the userStore
  inputValue.firstname = userStore.profile?.firstname ?? "";
  inputValue.lastname = userStore.profile?.lastname ?? "";
  inputValue.partnerPseudo = pseudoStore.partnerPseudo ?? "";

  // Save original values to compare later
  originalValues.firstname = inputValue.firstname;
  originalValues.lastname = inputValue.lastname;
  originalValues.partnerPseudo = inputValue.partnerPseudo;
};

const getChangedFields = (originalValues: any, currentValues: any) => {
  return Object.fromEntries(
    Object.entries(currentValues).filter(([key, value]) => value !== originalValues[key])
  );
};

const saveChanges = async () => {
  const changed = getChangedFields(originalValues, inputValue);

  if (changed.firstname || changed.lastname) {
    await userStore.updateProfile(
      changed.firstname as string,
      changed.lastname as string
    );
  }

  if (changed.partnerPseudo) {
    await pseudoStore.updatePartnerPseudo(changed.partnerPseudo as string);
  }

  showAccount.value = false;
};

const { logout } = useAuth();
</script>

<style lang="scss">
.bottom-menu-bar {
  padding: 0.5rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(3px);
  border-radius: 2rem;

  .items {
    gap: 4rem;

    .item {
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }

      .icon {
        margin: 1rem;
      }
    }
  }
}

.n-input {
  height: 5rem;

  display: flex;
  justify-content: center;
  align-items: center;

  &:hover,
  &:focus,
  &:focus-within {
    --n-border-hover: transparent !important;
    --n-border-focus: transparent !important;
    --n-box-shadow-focus: transparent !important;
    box-shadow: none !important;
    border: none !important;

    --n-caret-color: v-bind(currentThemeColor) !important;

    outline: none !important;
  }
}

input {
  padding: 0.5rem 1.5rem;
  border-radius: 1rem;
  border: none;
  outline: none;
  font-size: 1.5rem;
  font-weight: 600;
  color: #555555;
  transition: padding 0.3s 0.2s ease;
  resize: none;
}

.n-collapse .n-collapse-item .n-collapse-item__header .n-collapse-item__header-main {
  font-weight: 700;
}
</style>
