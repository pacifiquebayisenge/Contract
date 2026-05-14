// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	devtools: { enabled: true },
	devServer: {
		port: 3008,
	},

	modules: [
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxtjs/tailwindcss',
		'nuxtjs-naive-ui',
		'@vite-pwa/nuxt',
		'@pinia/nuxt',
		'@hypernym/nuxt-anime',
		'@nuxtjs/supabase',
	],

	supabase: {
		redirect: false,
		clientOptions: {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		},
		cookieOptions: {
			maxAge: 60 * 60 * 24 * 30, // 30 days
			sameSite: 'lax',
			secure: false, // IMPORTANT for localhost
		},
	},

	router: {
		options: {
			hashMode: true,
		},
	},

	anime: {
		composables: true, // Allows use of useAnime() composable
		autoImport: true, // Auto-imports composables globally (if composables: true)
		provide: true, // Provides $anime globally (default: true)
	},

	runtimeConfig: {
		privateVapid: process.env.NUXT_PRIVATE_VAPID,
		publicVapid: process.env.NUXT_PUBLIC_VAPID,

		supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
		supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
	},

	css: ['assets/main.scss', 'assets/css/tailwind.css'],

	ssr: false,

	app: {
		head: {
			title: 'Ugovor',

			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
				{
					rel: 'apple-touch-icon',
					sizes: '180x180',
					href: '/apple-touch-icon.png',
				},
			],
			meta: [
				{ name: 'description', content: 'Contract management application' },
				{ property: 'og:title', content: 'Ugovor' },
				{
					property: 'og:description',
					content: 'Contract management application',
				},
				{ name: 'mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-capable', content: 'yes' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
				{ name: 'apple-mobile-web-app-title', content: 'Ugovor' },
				{ name: 'theme-color', content: '#F9F9FB' },
				{
					name: 'viewport',
					content:
						'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
				},
				{ name: 'format-detection', content: 'telephone=no' },
				{ name: 'apple-touch-fullscreen', content: 'yes' },
				// try 'default' instead of 'black-translucent'
			],
		},
	},

	build: {
		transpile: [
			'naive-ui',
			'vueuc',
			'@css-render/vue3-ssr',
			'@juggle/resize-observer',

			'@css-render/plugin-bem',
		],
	},

	pwa: {
		registerType: 'autoUpdate',
		navigateFallback: null, // IMPORTANT: do not serve cached fallback for auth routes
		navigateFallbackDenylist: [/\/auth\//, /supabase/],

		devOptions: {
			enabled: false,
			type: 'module',
		},
		client: {
			installPrompt: true,
			periodicSyncForUpdates: 20,
		},

		workbox: {
			navigateFallback: '/',
			navigateFallbackDenylist: [
				/^\/_/,
				/\/api\//,
				/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot|otf)$/,
			],
			importScripts: ['/sw-push.js'],

			globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2,woff,ttf,eot}'],
			globIgnores: ['**/sw-push.js'],
			cleanupOutdatedCaches: true,
			clientsClaim: true,
			skipWaiting: true,
			runtimeCaching: [
				{
					urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
					handler: 'CacheFirst',
					options: {
						cacheName: 'google-fonts-cache',
						expiration: {
							maxEntries: 10,
							maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
						},
					},
				},
				{
					urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
					handler: 'CacheFirst',
					options: {
						cacheName: 'gstatic-fonts-cache',
						expiration: {
							maxEntries: 10,
							maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
						},
					},
				},
			],
		},

		manifest: {
			name: 'Ugovor',
			short_name: 'Ugovor',
			description: 'Contract management application',
			theme_color: '#ffffff',
			background_color: '#ffffff',
			display_override: ['standalone', 'minimal-ui', 'browser'],
			display: 'standalone',
			start_url: '/',
			scope: '/',
			// Add this to ensure navigation stays in PWA
			prefer_related_applications: false,
			id: '/',
			categories: ['business', 'productivity'],
			icons: [
				{
					src: 'icons/icon-48x48.png',
					sizes: '48x48',
					type: 'image/png',
				},
				{
					src: 'icons/icon-72x72.png',
					sizes: '72x72',
					type: 'image/png',
				},
				{
					src: 'icons/icon-96x96.png',
					sizes: '96x96',
					type: 'image/png',
				},
				{
					src: 'icons/icon-128x128.png',
					sizes: '128x128',
					type: 'image/png',
				},
				{
					src: 'icons/icon-144x144.png',
					sizes: '144x144',
					type: 'image/png',
				},
				{
					src: 'icons/icon-152x152.png',
					sizes: '152x152',
					type: 'image/png',
				},
				{
					src: 'icons/icon-192x192.png',
					sizes: '192x192',
					type: 'image/png',
				},
				{
					src: 'icons/icon-256x256.png',
					sizes: '256x256',
					type: 'image/png',
				},
				{
					src: 'icons/icon-384x384.png',
					sizes: '384x384',
					type: 'image/png',
				},
				{
					src: 'icons/icon-512x512.png',
					sizes: '512x512',
					type: 'image/png',
				},
			],
		},
	},

	vite: {
		optimizeDeps: {
			include: [
				'naive-ui',
				'echarts',
				'echarts/core',
				'echarts/charts',
				'echarts/components',
				'echarts/renderers',
				'vue-echarts',
				'@heroicons/vue/24/outline',
				'date-fns',
				'date-fns-tz',
				'vueuc',
				'@css-render/vue3-ssr',
				'@css-render/plugin-bem',
				'pinia',
				'@vueuse/core',
				'vue-router',
			],
		},
		server: {
			warmup: {
				clientFiles: [
					'./app.vue',
					'./pages/**/*.vue',
					'./components/**/*.vue',
					'./layouts/**/*.vue',
				],
			},
		},
		logLevel: 'warn',
	},

	nitro: {
		devStorage: {
			cache: {
				driver: 'memory',
			},
		},
	},
})
