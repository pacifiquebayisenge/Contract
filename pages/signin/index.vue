<template>
  <div class="flex justify-center items-center p-4">
    <n-card  class="max-w-sm w-full">


     <template #header>
        <div class="text-center font-semibold text-xxlg">Login</div>
      </template>


      <n-input v-model:value="email" type="email" placeholder="Email" class="mb-4">
        <template #prefix>
          <UserIcon class="w-5 h-5 text-gray-500" />
        </template>
      </n-input>

      <n-input
        v-model:value="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Password"
        class="mb-4"
      >
        <template #suffix>
          <component
            :is="showPassword ? EyeSlashIcon : EyeIcon"
            class="w-5 h-5 cursor-pointer text-gray-500"
            @click="showPassword = !showPassword"
          />
        </template>
      </n-input>

      <n-button type="primary" block @click="login" :loading="loading"> Log In </n-button>

      <div class="flex flex-col items-center mt-4 space-y-8">
        <n-text class="mt-6 text-center">Don't have an account?</n-text>

        <n-button text @click="navigateTo('/signup')"> Sign Up </n-button>
      </div>

      <n-alert class="mt-4" v-if="message" type="error">
        {{ message }}
      </n-alert>
    </n-card>
  </div>
</template>

<script setup>
import { UserIcon } from "@heroicons/vue/24/outline";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/solid";

definePageMeta({
  layout: "auth",
});

const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const message = ref("");
const loading = ref(false);
const showPassword = ref(false);

async function login() {
  loading.value = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  loading.value = false;

  if (error) message.value = error.message;
  else navigateTo("/");
}
</script>
