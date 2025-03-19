const appName = "Local Tools";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-03-16",
  devtools: { enabled: true },
  modules: [
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/fonts",
    "@nuxtjs/i18n",
    "@nuxtjs/color-mode",
    "nuxt-gtag",
    "@nuxtjs/sitemap",
  ],
  app: {
    head: {
      link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
    },
  },
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
      {
        code: "es",
        name: "Español",
      },
      {
        code: "pt",
        name: "Português",
      },
      {
        code: "id",
        name: "Bahasa Indonesia",
      },
      {
        code: "fr",
        name: "Français",
      },
      {
        code: "ja",
        name: "日本語",
      },
      {
        code: "ru",
        name: "Русский",
      },
      {
        code: "de",
        name: "Deutsch",
      },
    ],
    defaultLocale: "en", // default locale of your project for Nuxt pages and routings
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
  },
  runtimeConfig: {
    public: {
      appName,
      githubRepo: "phphe/local-tools",
    },
  },
});
