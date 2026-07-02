import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  // Only activate SW in production; avoids dev noise
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Notes — StaleWhileRevalidate
    {
      urlPattern: /^https?:\/\/.*\/notes/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'nexuslearn-notes',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // Flashcards — StaleWhileRevalidate
    {
      urlPattern: /^https?:\/\/.*\/flashcards/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'nexuslearn-flashcards',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
    // Materials — StaleWhileRevalidate
    {
      urlPattern: /^https?:\/\/.*\/study/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'nexuslearn-study',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },

    // Google Fonts — CacheFirst
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'nexuslearn-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // OSM Map tiles — CacheFirst
    {
      urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'nexuslearn-map-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default pwaConfig(nextConfig)
