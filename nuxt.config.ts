// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["vuetify/lib/styles/main.sass"],
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
