<template>
  <div class="default-layout">
    <div
      class="main-nav fixed w-full top-0 left-0 px-4 h-12 gap-1 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center z-1"
    >
      <NuxtLinkLocale to="/" class="flex items-center">
        <img src="/favicon.png" alt="logo" class="h-8 mr-2" />
        {{ t("appName") }}
      </NuxtLinkLocale>
      <div class="flex-grow"></div>
      <a
        v-if="$config.public.githubRepo"
        title="GitHub"
        target="_blank"
        :href="'https://github.com/' + $config.public.githubRepo"
      >
        <Icon :path="mdiGithub" :size="23" />
      </a>
      <Popover menu>
        <button :title="t('language')">
          {{ localeProperties.name }}
          <Caret class="ml-1" />
        </button>
        <template #content>
          <a
            href="#"
            v-for="locale in locales"
            :key="locale.code"
            @click.prevent="setLocale(locale.code)"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {{ locale.name }}
          </a>
        </template>
      </Popover>
      <button
        :title="t('toggleColor')"
        @click="
          $colorMode.preference =
            $colorMode.preference === 'dark' ? 'light' : 'dark'
        "
      >
        <Icon :path="mdiWhiteBalanceSunny" :size="23" />
      </button>
      <button
        v-if="sm"
        :title="t('toggleSidebar')"
        @click="sidebarVisible = !sidebarVisible"
      >
        <Icon :path="mdiMenu" :size="23" />
      </button>
    </div>
    <Transition name="main-sidebar-slide-fade">
      <div
        class="main-sidebar fixed w-55 left-0 top-12 bottom-0 overflow-hidden flex flex-col border-r dark:border-gray-700 bg-white dark:bg-gray-800"
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
          <!-- menu -->
          <div class="main-menu text-gray-600 pt-4 px-4">
            <template v-for="(group, gi) in menu">
              <div class="menu-group" :class="{ 'mt-6': gi > 0 }">
                <div class="text-sm font-bold mb-2">{{ group.title }}</div>
                <template v-for="(item, index) in group.items">
                  <NuxtLinkLocale :to="item.path" class="main-menu-item ml-4">
                    {{ item.title }}
                  </NuxtLinkLocale>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
    <div class="main-right pt-12" :class="{ 'ml-55': !sm && sidebarVisible }">
      <div class="main-body px-4 max-w-5xl">
        <!-- alert -->
        <Alert class="mt-2">{{ t("privateNotice") }}</Alert>
        <slot />
      </div>
      <div class="py-10 text-center text-sm text-gray-500 dark:text-gray-300">
        Copyright © {{ t("appName") }} {{ year }}. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiMenu, mdiClose, mdiWhiteBalanceSunny, mdiGithub } from "@mdi/js";

const { locale, locales, setLocale, localeProperties, t } = useI18n();

useHead({
  htmlAttrs: {
    lang: locale,
  },
});

const sidebarVisible = ref(true);
const sm = computed(() => windowSize.value.width < 760);
const year = new Date().getFullYear();

//
useHead({
  titleTemplate: (title) => {
    return t("htmlTitleTpl", { title });
  },
});

// menu
const menu = computed(() => {
  return [
    {
      title: t("audio"),
      items: [{ title: t("audioTrimmer"), path: "/audio-trim" }],
    },
    {
      title: t("image"),
      items: [
        { title: t("imageCrop"), path: "/image-crop" },
        { title: t("imageResize"), path: "/image-resize" },
        { title: t("imageConvert"), path: "/image-convert" },
        { title: t("faviconGen"), path: "/favicon-generator" },
        { title: t("imageRemoveBgColors"), path: "/image-remove-bg-colors" },
        { title: t("imageColorPicker"), path: "/image-color-picker" },
        { title: t("imageBlur"), path: "/image-blur" },
        { title: t("imageFlip"), path: "/image-flip" },
        { title: t("imageGrayscale"), path: "/image-grayscale" },
        { title: t("imageInvert"), path: "/image-invert" },
        { title: t("imageOpacity"), path: "/image-opacity" },
        { title: t("imageRotate"), path: "/image-rotate" },
        { title: t("imageRound"), path: "/image-round" },
      ],
    },
  ];
});

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

// 点击外部关闭下拉框
onMounted(() => {});
onUnmounted(() => {
  window.removeEventListener("resize", updateWindowSize);
});
</script>

<style lang="scss">
.default-layout {
  font-family: "Open Sans";
}

.main-nav {
  button, a{
    --at-apply: flex items-center px-2 h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-700;
  }
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
  min-height: calc(100vh - 160px);
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
<i18n lang="yaml">
zh:
  image: "图片"
  audio: "音频"
  audioTrimmer: "剪辑音频"
  faviconGen: "Favicon 生成器"
  imageBlur: "图片模糊化"
  imageColorPicker: "图片颜色选择器"
  imageConvert: "图片格式转换"
  imageCrop: "图片裁剪"
  imageFlip: "图片翻转"
  imageGrayscale: "图片灰度化"
  imageInvert: "图片反色"
  imageOpacity: "图片透明调整"
  imageRemoveBgColors: "图片去除背景颜色"
  imageResize: "图片缩放"
  imageRotate: "图片旋转"
  imageRound: "图片圆角"
en:
  image: "Image"
  audio: "Audio"
  audioTrimmer: "Audio Trimmer"
  faviconGen: "Favicon Generator"
  imageBlur: "Image Blur"
  imageColorPicker: "Image Color Picker"
  imageConvert: "Image Converter"
  imageCrop: "Image Crop"
  imageFlip: "Image Flip"
  imageGrayscale: "Image Grayscale"
  imageInvert: "Image Invert"
  imageOpacity: "Image Opacity"
  imageRemoveBgColors: "Remove Background Colors"
  imageResize: "Image Resize"
  imageRotate: "Image Rotate"
  imageRound: "Image Round Corners"
es:
  image: "Imagen"
  audio: "Audio"
  audioTrimmer: "Recortador de Audio"
  faviconGen: "Generador de Favicon"
  imageBlur: "Desenfoque de Imagen"
  imageColorPicker: "Selector de Color de Imagen"
  imageConvert: "Convertidor de Imagen"
  imageCrop: "Recortar Imagen"
  imageFlip: "Voltear Imagen"
  imageGrayscale: "Escala de Grises"
  imageInvert: "Invertir Imagen"
  imageOpacity: "Opacidad de Imagen"
  imageRemoveBgColors: "Eliminar Colores de Fondo"
  imageResize: "Redimensionar Imagen"
  imageRotate: "Rotar Imagen"
  imageRound: "Esquinas Redondeadas"
pt:
  image: "Imagem"
  audio: "Áudio"
  audioTrimmer: "Cortador de Áudio"
  faviconGen: "Gerador de Favicon"
  imageBlur: "Desfoque de Imagem"
  imageColorPicker: "Seletor de Cores"
  imageConvert: "Conversor de Imagem"
  imageCrop: "Recortar Imagem"
  imageFlip: "Inverter Imagem"
  imageGrayscale: "Escala de Cinza"
  imageInvert: "Inverter Cores"
  imageOpacity: "Opacidade de Imagem"
  imageRemoveBgColors: "Remover Cores de Fundo"
  imageResize: "Redimensionar Imagem"
  imageRotate: "Rotacionar Imagem"
  imageRound: "Cantos Arredondados"
id:
  image: "Gambar"
  audio: "Audio"
  audioTrimmer: "Pemotong Audio"
  faviconGen: "Generator Favicon"
  imageBlur: "Blur Gambar"
  imageColorPicker: "Pemilih Warna Gambar"
  imageConvert: "Konverter Gambar"
  imageCrop: "Potong Gambar"
  imageFlip: "Balik Gambar"
  imageGrayscale: "Skala Abu-abu"
  imageInvert: "Inversi Gambar"
  imageOpacity: "Transparansi Gambar"
  imageRemoveBgColors: "Hapus Warna Latar Belakang"
  imageResize: "Ubah Ukuran Gambar"
  imageRotate: "Putar Gambar"
  imageRound: "Sudut Bulat"
fr:
  image: "Image"
  audio: "Audio"
  audioTrimmer: "Découpeur Audio"
  faviconGen: "Générateur de Favicon"
  imageBlur: "Flou d'Image"
  imageColorPicker: "Sélecteur de Couleur"
  imageConvert: "Convertisseur d'Image"
  imageCrop: "Recadrer l'Image"
  imageFlip: "Retourner l'Image"
  imageGrayscale: "Niveaux de Gris"
  imageInvert: "Inverser l'Image"
  imageOpacity: "Opacité d'Image"
  imageRemoveBgColors: "Supprimer Couleurs de Fond"
  imageResize: "Redimensionner l'Image"
  imageRotate: "Rotation d'Image"
  imageRound: "Coins Arrondis"
ja:
  image: "画像"
  audio: "音声"
  audioTrimmer: "音声トリマー"
  faviconGen: "Favicon ジェネレーター"
  imageBlur: "画像ぼかし"
  imageColorPicker: "カラーピッカー"
  imageConvert: "画像変換"
  imageCrop: "画像切り抜き"
  imageFlip: "画像反転"
  imageGrayscale: "グレースケール"
  imageInvert: "色反転"
  imageOpacity: "不透明度調整"
  imageRemoveBgColors: "背景色削除"
  imageResize: "画像サイズ変更"
  imageRotate: "画像回転"
  imageRound: "角丸め"
ru:
  image: "イзображение"
  audio: "Аудио"
  audioTrimmer: "Обрезка Аудио"
  faviconGen: "Генератор Favicon"
  imageBlur: "Размытие Изображения"
  imageColorPicker: "Пипетка"
  imageConvert: "Конвертер Изображений"
  imageCrop: "Обрезка Изображения"
  imageFlip: "Отражение Изображения"
  imageGrayscale: "Оттенки Серого"
  imageInvert: "Инверсия Цветов"
  imageOpacity: "Прозрачность"
  imageRemoveBgColors: "Удаление Цветов Фона"
  imageResize: "Изменение Размера"
  imageRotate: "Поворот Изображения"
  imageRound: "Скругление Углов"
de:
  image: "Bild"
  audio: "Audio"
  audioTrimmer: "Audio-Trimmer"
  faviconGen: "Favicon-Generator"
  imageBlur: "Bildunschärfe"
  imageColorPicker: "Farbwähler"
  imageConvert: "Bildkonverter"
  imageCrop: "Bild zuschneiden"
  imageFlip: "Bild spiegeln"
  imageGrayscale: "Graustufen"
  imageInvert: "Farben invertieren"
  imageOpacity: "Bildtransparenz"
  imageRemoveBgColors: "Hintergrundfarben entfernen"
  imageResize: "Bildgröße ändern"
  imageRotate: "Bild drehen"
  imageRound: "Abgerundete Ecken"
</i18n>
