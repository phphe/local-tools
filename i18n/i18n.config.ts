export default defineI18nConfig(() => ({
  legacy: false, // to use Composition API. will be removed at vue-i18n v12 https://vue-i18n.intlify.dev/api/general.html#legacy
  messages: {
    zh: {
      appName: "本地工具箱",
      Home: "首页",
      About: "关于",
      notFound: "😭内容未找到",
      autoColor: "自动",
      lightColor: "浅色",
      darkColor: "暗色",
      toggleColor: "切换颜色",
      toggleSidebar: "切换侧边栏",
      privateNotice:
        "📢 您的文件将仅在浏览器本地进行处理，不会上传至任何服务器。",
    },
    en: {
      appName: "Local Tools",
      Home: "Home",
      About: "About",
      notFound: "😭Content not found",
      autoColor: "Auto",
      lightColor: "Light",
      darkColor: "Dark",
      toggleColor: "切换颜色",
      toggleSidebar: "Toggle Sidebar",
      privateNotice:
        "📢 Your files will be processed locally in your browser only and will not be uploaded to any servers.",
    },
  },
}));
