export {}

declare module '#app' {
  interface NuxtApp {
    $authLoading: {
      visible: Ref<boolean>
      show: () => void
      hide: () => void
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $authLoading: {
      visible: Ref<boolean>
      show: () => void
      hide: () => void
    }
  }
}
