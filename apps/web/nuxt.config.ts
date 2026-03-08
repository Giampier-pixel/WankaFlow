import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    '@vueuse/nuxt'
  ],
  vite: {
    plugins: [tailwindcss()]
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'MarketFlow - B2B/B2C E-Commerce Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'MarketFlow - Your trusted B2B/B2C e-commerce platform with wholesale pricing and fast shipping' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap' }
      ]
    }
  },
  typescript: {
    strict: true
  },
  compatibilityDate: '2024-11-01'
})
