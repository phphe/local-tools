export default defineI18nConfig(() => ({
  legacy: false, // to use Composition API. will be removed at vue-i18n v12 https://vue-i18n.intlify.dev/api/general.html#legacy
  messages: {
    zh: {
      appName: "本地工具箱",
      htmlTitleTpl: "{title} - 本地处理 无需上传",
      Home: "首页",
      About: "关于",
      notFound: "😭内容未找到",
      autoColor: "自动",
      lightColor: "浅色",
      darkColor: "暗色",
      toggleColor: "切换颜色",
      toggleSidebar: "切换侧边栏",
      language: "语言",
      privateNotice:
        "📢 您的文件将仅在浏览器本地进行处理，不会上传至任何服务器。",
      browserNotSupported:
        "您的浏览器不支持所需功能。请升级或更换到 Chrome、Firefox 或 Edge 等现代浏览器。",
    },
    en: {
      appName: "Local Tools",
      htmlTitleTpl: "{title} - Local Processing, Zero Upload",
      Home: "Home",
      About: "About",
      notFound: "😭Content not found",
      autoColor: "Auto",
      lightColor: "Light",
      darkColor: "Dark",
      toggleColor: "Toggle Color",
      toggleSidebar: "Toggle Sidebar",
      language: "Language",
      privateNotice:
        "📢 Your files will be processed locally in your browser only and will not be uploaded to any servers.",
      browserNotSupported:
        "Your browser does not support required features. Please upgrade or switch to a modern browser like Chrome, Firefox, or Edge.",
    },
  },
}));
