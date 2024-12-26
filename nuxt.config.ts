// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
export default defineNuxtConfig({

  modules: ['nuxt-svgo-loader', '@nuxt/eslint', 'nuxt-lodash', 'nuxt3-vuex-module'],
  plugins: ['~/plugins/global.js', '~/plugins/axios.js'],
  ssr: false,
  components: true,
  devtools: { enabled: true },

  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    network: process.env.NETWORK || 'mainnet',
    public: {
      network: process.env.NETWORK || 'mainnet',
    },
  },
  compatibilityDate: '2024-11-01',

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
              @use "@/assets/styles/_colors" as *;
            @use "@/assets/styles/_breakpoints" as *;
          `,
        },
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },

})
