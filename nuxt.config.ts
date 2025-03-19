const appName = "Local Tools";
const appUrl = "https://local-tools.phphe.com";

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
  gtag: {
    id: "G-SK9BR8SJTB",
    enabled: process.env.NODE_ENV === "production",
  },
  site: {
    url: appUrl,
    name: appName,
  },
  i18n: {
    // vueI18n: "./i18n.config.ts",
    // used in URL path prefix
    locales: [
      {
        code: "en",
        name: "English",
        language: "en-US",
      },
      {
        code: "zh",
        name: "简体中文",
        language: "zh-CN",
      },
      {
        code: "es",
        name: "Español",
        language: "es-ES",
      },
      {
        code: "pt",
        name: "Português",
        language: "pt-BR",
      },
      {
        code: "id",
        name: "Bahasa Indonesia",
        language: "id-ID",
      },
      {
        code: "fr",
        name: "Français",
        language: "fr-FR",
      },
      {
        code: "ja",
        name: "日本語",
        language: "ja-JP",
      },
      {
        code: "ru",
        name: "Русский",
        language: "ru-RU",
      },
      {
        code: "de",
        name: "Deutsch",
        language: "de-DE",
      },
    ],
    defaultLocale: "en",
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
    baseUrl: appUrl,
  },
  runtimeConfig: {
    public: {
      appName,
      githubRepo: "phphe/local-tools",
    },
  },
});
