// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['vuetify/lib/styles/main.sass', '/assets/main.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        sass: {
          api: 'modern-compiler',
        },
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    optimizeDeps: {
      exclude: [
        '@ain1084/audio-worklet-stream',
      ],
    },
    plugins: [
      vuetify({
        autoImport: true,
        styles: 'sass',
      }),
      {
        name: 'configure-response-headers',
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
            next()
          })
        },
      },
    ],
  },
  nitro: {
    rollupConfig: {
      external: '@ain1084/audio-worklet-stream',
    },
    routeRules: {
      '/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin',
        },
      },
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: ['@nuxt/eslint'],
  runtimeConfig: {
    private: {
      github: {
        token: process.env.GITHUB_TOKEN,
      },
    },
    public: {
      github: {
        owner: 'ain1084',
        repo: 'rust_fbd_sequencer',
        path: 'fbd_files',
      },
    },
  },
  compatibilityDate: '2024-07-13',
})
