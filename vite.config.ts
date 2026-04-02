import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // Manifest configuration
      manifest: {
        name: 'Vitality - Health & Fitness Tracker',
        short_name: 'Vitality',
        description: 'Holistic Health & Fitness Habit Tracker - Track fasting, exercise, sleep, and more',
        theme_color: '#012d1d',
        background_color: '#f9faf2',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        id: '/',
        
        // App icons
        icons: [
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        
        // Categories for app stores
        categories: ['health', 'fitness', 'lifestyle'],
        
        // Screenshots for install prompt
        screenshots: [
          {
            src: '/screenshot-1.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Dashboard'
          },
          {
            src: '/screenshot-2.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Dashboard Desktop'
          }
        ],
        
        // Related apps
        related_applications: [],
        prefer_related_applications: false,
        
        // Shortcuts for quick actions
        shortcuts: [
          {
            name: 'Start Fasting',
            short_name: 'Fasting',
            description: 'Start a new fasting session',
            url: '/fasting',
            icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Log Exercise',
            short_name: 'Exercise',
            description: 'Log your workout',
            url: '/exercise',
            icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Track Water',
            short_name: 'Hydration',
            description: 'Log water intake',
            url: '/hydration',
            icons: [{ src: '/icon-96x96.png', sizes: '96x96' }]
          }
        ]
      },
      
      // Workbox configuration for caching
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        globIgnores: ['**/node_modules/**/*'],
        
        // Runtime caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/kehrgmmtctrfvboqyewt\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
        
        // Skip waiting for immediate activation
        skipWaiting: true,
        clientsClaim: true,
        
        // Clean up old caches
        cleanupOutdatedCaches: true
      },
      
      // Development options
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  
  server: {
    port: 5173,
    host: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  }
})
