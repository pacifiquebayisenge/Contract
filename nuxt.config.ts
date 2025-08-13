// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "nuxtjs-naive-ui",
    "@vite-pwa/nuxt",
  ],

  css: ["assets/main.css", "assets/css/tailwind.css"],

  ssr: false,

  app: {
    head: {
      title: "Ugovor",
      link: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
      meta: [
        { name: "description", content: "Contract management application" },
        { property: "og:title", content: "Ugovor" },
        {
          property: "og:description",
          content: "Contract management application",
        },
        { name: "theme-color", content: "#000000" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black" },
        { name: "apple-mobile-web-app-title", content: "Ugovor" },
      ],
    },
  },

  build: {
    transpile: [
      "naive-ui",
      "vueuc", // <-- Add this!
      "@css-render/vue3-ssr",
      "@juggle/resize-observer",
      "date-fns",
      "@css-render/plugin-bem",
    ],
  },

  pwa: {
    registerType: "autoUpdate",

    devOptions: {
      enabled: true, // Enable PWA in development
      suppressWarnings: true,
      type: "module",
    },

    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20, // Check for updates every 20 seconds in dev
    },

    manifest: {
      name: "Ugovor",
      short_name: "Ugovor",
      description: "Contract management application",
      theme_color: "#000000",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      // icons: [
      //   {
      //     src: "/icon-192x192.png",
      //     sizes: "192x192",
      //     type: "image/png",
      //   },
      // ],
    },
  },

  vite: {
    optimizeDeps: {
      include: ["naive-ui"],
    },
  },
});
