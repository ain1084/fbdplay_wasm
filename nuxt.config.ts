// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify from "vite-plugin-vuetify";

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["vuetify/lib/styles/main.sass"],
  vite: {
    plugins: [
      vuetify({
        autoImport: true,
        styles: "sass",
      }),
    ],
  },
  nitro: {
    routeRules: {
      "/**": {
        cors: true,
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin",
        },
      },
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  runtimeConfig: {
    private: {
      github: {
        token: process.env.GITHUB_TOKEN,
      },
    },
    public: {
      github: {
        owner: "ain1084",
        repo: "rust_fbd_sequencer",
        path: "fbd_files",
      },
    },
  },
});
