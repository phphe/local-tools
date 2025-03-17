const appName = "Local Tools";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-03-16",
  devtools: { enabled: true },

  modules: [
    "@unocss/nuxt",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    // "@nuxt/fonts",
    "@nuxtjs/i18n",
    "@nuxtjs/color-mode",
    "nuxt-gtag",
    "@nuxtjs/sitemap",
  ],
  colorMode: {
    classSuffix: "", //remove default '-mode' suffix
  },
  i18n: {
    // vueI18n: "./i18n.config.ts",
    // used in URL path prefix
    locales: [
      {
        code: "en",
        name: "English",
      },
      {
        code: "zh",
        name: "简体中文",
      },
    ],
    defaultLocale: "en", // default locale of your project for Nuxt pages and routings
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
  },
  runtimeConfig: {
    public: {
      appName,
    },
  },
});
