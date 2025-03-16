<template>
  <div class="default-layout">
    <div
      class="main-bar fixed w-full top-0 left-0 px-4 h-12 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center"
    >
      <NuxtLinkLocale to="/">{{ $t("appName") }}</NuxtLinkLocale>
      <div class="flex-grow"></div>
      <IconBtn
        class="bar-icon-btn ml-3"
        :title="$t('toggleColor')"
        @click="
          $colorMode.preference =
            colorMode.preference === 'dark' ? 'light' : 'dark'
        "
        :path="mdiWhiteBalanceSunny"
        :size="23"
      />
      <IconBtn
        class="bar-icon-btn ml-3"
        :title="$t('toggleSidebar')"
        v-if="sm"
        @click="sidebarVisible = !sidebarVisible"
        :path="mdiMenu"
        :size="23"
      />
    </div>
    <Transition name="main-sidebar-slide-fade">
      <div
        class="main-sidebar fixed w-72 left-0 top-12 bottom-0 overflow-hidden flex flex-col border-r dark:border-gray-700 bg-white dark:bg-gray-800"
        :class="{ 'z-10': sm }"
        v-show="sidebarVisible"
      >
        <button
          v-if="sm"
          @click="sidebarVisible = false"
          class="absolute right-2 top-2"
        >
          <Icon :path="mdiClose" :size="25" />
        </button>
        <div class="flex-grow overflow-auto">
          <div class="main-title text-2xl text-gray-700 mt-32 ml-16">
            <NuxtLinkLocale to="/">{{ $t("appName") }}</NuxtLinkLocale>
          </div>
          <div class="main-menu mt-6 text-gray-600 ml-16">
            <!-- <NuxtLinkLocale to="/" class="main-menu-item">{{
              $t("Home")
            }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/works" class="main-menu-item">{{
              $t("Works")
            }}</NuxtLinkLocale>
            <NuxtLinkLocale to="/about" class="main-menu-item">{{
              $t("About")
            }}</NuxtLinkLocale> -->
            <a
              class="main-menu-item cursor-pointer select-none"
              @click="$colorMode.preference = colorModeInfo.next"
            >
              <client-only>{{ colorModeInfo.curText }}</client-only>
              <Icon :path="mdiWhiteBalanceSunny" />
            </a>
            <NuxtLink
              :to="$localePath('/', i18n.locale.value === 'en' ? 'zh' : 'en')"
              class="main-menu-item"
              >{{ i18n.locale.value === "en" ? "中文" : "English" }}</NuxtLink
            >
          </div>
        </div>
      </div>
    </Transition>
    <div class="main-right pt-12" :class="{ 'ml-72': sidebarVisible }">
      <div class="main-body px-4 max-w-5xl">
        <!-- alert -->
        <Alert class="mt-2">{{ $t("privateNotice") }}</Alert>
        <slot />
      </div>
      <div class="py-10 text-center text-sm text-gray-500 dark:text-gray-300">
        Copyright © {{ $t("appName") }} {{ year }}. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiMenu, mdiClose, mdiWhiteBalanceSunny } from "@mdi/js";
const i18n = useI18n();

useHead({
  htmlAttrs: {
    lang: i18n.locale,
  },
});

const sidebarVisible = ref(true);
const sm = computed(() => windowSize.value.width < 760);
const year = new Date().getFullYear();

//
// useHead({
//   titleTemplate: (title) => {
//     return !title || title === appName ? appName : `${title} - ${appName}`;
//   },
// });

//
const windowSize = ref({
  width: 1920,
  height: 900,
});
const updateWindowSize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  sidebarVisible.value = !sm.value;
};

onBeforeMount(() => {
  updateWindowSize();
  window.addEventListener("resize", updateWindowSize);
});
onMounted(() => {});
onUnmounted(() => {
  window.removeEventListener("resize", updateWindowSize);
});

// color mode
const mapping = {
  system: "autoColor",
  dark: "darkColor",
  light: "lightColor",
};
const colorMode = useColorMode();
const colorModeInfo = computed(() => {
  const cur = colorMode.preference;
  // @ts-ignore
  const curText = i18n.t(mapping[cur]);
  const keys = Object.keys(mapping);
  let i = keys.indexOf(cur);
  const next = keys[i + 1] || keys[0];
  return {
    curText,
    next,
  };
});
</script>

<style lang="scss">
.default-layout {
  font-family: "Open Sans";
}

.main-bar {
}
.bar-icon-btn {
  // position: relative;
  // padding: 0.5rem;
  // margin: -0.5rem; // 负margin来抵消padding，保持原来的间距
  // border-radius: 0.375rem;
  // &:hover {
  //   @apply bg-gray-2 dark:bg-gray-600;
  // }
}

.main-sidebar {
  background-size: cover;
  background-position: center bottom;
}

.main-menu-item {
  --at-apply: block mt-4;
}

.main-body {
  min-height: 750px;
  min-height: calc(100vh - 100px);
}

.dark {
  --at-apply: bg-black;

  &,
  & a {
    color: #fff;
  }
}

// transition
.main-sidebar-slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.main-sidebar-slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.main-sidebar-slide-fade-enter-from,
.main-sidebar-slide-fade-leave-to {
  transform: translateX(-200px);
  opacity: 0;
}
</style>

<style lang="scss">
// custom pre tag's background color
pre.shiki.shiki-themes {
  background-color: #fdf6e3 !important;
}
.dark pre.shiki.shiki-themes {
  background-color: #24292e !important;
}
// fix pre tag's text color in light mode
.light pre.shiki.shiki-themes {
  color: #000000;
}
</style>
