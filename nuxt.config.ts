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
     '@pinia/nuxt',
  ],

  css: ["assets/main.css", "assets/css/tailwind.css"],

  ssr: false,

  app: {
    head: {
      title: "Ugovor",
      link: [
        { rel: "manifest", href: "/manifest.webmanifest" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }
      ],
      meta: [
        { name: "description", content: "Contract management application" },
        { property: "og:title", content: "Ugovor" },
        {
          property: "og:description",
          content: "Contract management application",
        },
        { name: "theme-color", content: "#ffffff" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "white" },
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
      navigateFallback: '/index.html',
      navigateFallbackAllowlist: [/^\/$/],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
            }
          }
        },
        {
        urlPattern: ({ request }) => request.mode === 'navigate', // Cache all navigation requests
        handler: 'NetworkFirst', // Try network, fallback to cache
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      },
      {
        urlPattern: /^\/_nuxt\/.*\.(js|css)$/i, // Cache Nuxt build assets
        handler: 'CacheFirst',
        options: {
          cacheName: 'nuxt-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60
          }
        }
      }
      ],
      globPatterns: [
        '**/*.{js,css,html,png,svg,ico,json,woff2,woff,ttf,eot}'
      ],
      additionalManifestEntries: [
      { url: '/index.html', revision: `${Date.now()}` },
      { url: '/manifest.webmanifest', revision: `${Date.now()}` }
    ],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },

    manifest: {
      name: "Ugovor",
      short_name: "Ugovor",
      description: "Contract management application",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
       scope: "/",
      id: "/",
      categories: ["business", "productivity"],
      "icons": [
    {
      "src": "icons/icon-48x48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-256x256.png",
      "sizes": "256x256",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
    },
  },

  vite: {
    optimizeDeps: {
      include: ["naive-ui"],
    },
  },
});
