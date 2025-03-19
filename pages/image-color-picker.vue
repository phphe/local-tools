<template>
  <div class="mt-4">
    <h1 class="text-2xl">{{ t("toolName") }}</h1>
    <div class="mt-4">
      <FileInput
        accept="image/*"
        acceptDescription="jpg,png,gif,webp,jpeg,bmp"
        @change="handleFileChange"
      />
    </div>
    <div v-if="currentFile" class="mt-4">
      <h2 class="text-lg">
        {{ currentFile.name }}
        <span class="text-sm text-gray-500 dark:text-gray-400" v-if="imageSize">
          ({{ imageSize.width }}x{{ imageSize.height }})
        </span>
      </h2>
      <div class="mt-4 flex gap-4">
        <div class="flex-1">
          <div class="relative">
            <img
              ref="imageRef"
              :src="imageUrl"
              class="max-w-[500px] max-h-[500px] object-contain cursor-crosshair border border-gray-300 dark:border-gray-600 border-dashed"
              @click="pickColor"
            />
            <div class="text-sm mt-1 text-gray-500">
              {{ t("clickToPickColor") }}
            </div>
          </div>
        </div>
        <div class="flex-1">
          <div v-if="selectedColor" class="space-y-4">
            <div class="flex items-center gap-2">
              <div
                class="w-10 h-10 border rounded"
                :style="{ backgroundColor: selectedColor.rgb }"
              ></div>
              <div class="text-sm">
                {{ t("position") }}: ({{ selectedColor.x }},
                {{ selectedColor.y }})
              </div>
            </div>
            <div class="space-y-2">
              <div
                v-for="(format, index) in colorFormats"
                :key="index"
                class="flex items-center gap-2"
              >
                <span class="text-sm w-12">{{ format.label }}:</span>
                <div
                  class="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {{ selectedColor[format.key] }}
                </div>
                <IconBtn
                  :path="mdiContentCopy"
                  @click="() => copyToClipboard(selectedColor[format.key])"
                  :title="t('copy')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiContentCopy } from "@mdi/js";
import { useClipboard } from "@vueuse/core";

const { copy } = useClipboard();

interface ColorInfo {
  rgb: string;
  hex: string;
  hsl: string;
  x: number;
  y: number;
}

const colorFormats = [
  { key: "rgb", label: "RGB" },
  { key: "hex", label: "HEX" },
  { key: "hsl", label: "HSL" },
];

// check browser support for image
useCheckBrowserSupportForImage();

const { t } = useI18n({
  useScope: "local",
});

useSeoMeta({
  title: t("toolName"),
  description: t("description"),
});

const currentFile = ref<File | null>(null);
const imageUrl = ref("");
const imageRef = ref<HTMLImageElement>();
const selectedColor = ref<ColorInfo | null>(null);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    selectedColor.value = null;
    imageSize.value = null;

    const img = new Image();
    img.onload = () => {
      imageSize.value = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    };
    img.src = imageUrl.value;
  }
};

const rgbToHex = (r: number, g: number, b: number) => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`;
};

const pickColor = (e: MouseEvent) => {
  const img = imageRef.value;
  if (!img) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
  const [r, g, b] = pixel;

  selectedColor.value = {
    rgb: `rgb(${r}, ${g}, ${b})`,
    hex: rgbToHex(r, g, b),
    hsl: rgbToHsl(r, g, b),
    x: Math.round(x * scaleX),
    y: Math.round(y * scaleY),
  };
};

const copyToClipboard = async (text: string) => {
  await copy(text);
};

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<i18n lang="yaml">
en:
  toolName: "Image Color Picker"
  description: "Online free image color picker, no registration required. Supports RGB, HEX and HSL formats."
  position: "Position"
  clickToPickColor: "Click anywhere on the image to pick color"
  copy: "Copy to clipboard"
zh:
  toolName: "图片取色器"
  description: "在线免费从图片中提取颜色，支持RGB、HEX和HSL格式。无需上传和注册。"
  position: "坐标"
  clickToPickColor: "点击图片任意位置提取颜色"
  copy: "复制到剪贴板"
es:
  toolName: "Selector de Color de Imagen"
  description: "Selector de color de imagen en línea gratuito, sin registro necesario. Compatible con formatos RGB, HEX y HSL."
  position: "Posición"
  clickToPickColor: "Haga clic en cualquier parte de la imagen para seleccionar el color"
  copy: "Copiar al portapapeles"
pt:
  toolName: "Seletor de Cores de Imagem"
  description: "Seletor de cores de imagem online gratuito, sem necessidade de registro. Suporta formatos RGB, HEX e HSL."
  position: "Posição"
  clickToPickColor: "Clique em qualquer lugar da imagem para selecionar a cor"
  copy: "Copiar para área de transferência"
id:
  toolName: "Pemilih Warna Gambar"
  description: "Pemilih warna gambar online gratis, tanpa perlu registrasi. Mendukung format RGB, HEX dan HSL."
  position: "Posisi"
  clickToPickColor: "Klik di mana saja pada gambar untuk memilih warna"
  copy: "Salin ke clipboard"
fr:
  toolName: "Sélecteur de Couleur d'Image"
  description: "Sélecteur de couleur d'image en ligne gratuit, sans inscription requise. Prend en charge les formats RGB, HEX et HSL."
  position: "Position"
  clickToPickColor: "Cliquez n'importe où sur l'image pour sélectionner la couleur"
  copy: "Copier dans le presse-papiers"
ja:
  toolName: "画像カラーピッカー"
  description: "無料オンライン画像カラーピッカー、登録不要。RGB、HEX、HSL形式に対応。"
  position: "位置"
  clickToPickColor: "画像の任意の場所をクリックして色を選択"
  copy: "クリップボードにコピー"
ru:
  toolName: "Пипетка для Изображений"
  description: "Бесплатная онлайн-пипетка для выбора цвета из изображения, без регистрации. Поддерживает форматы RGB, HEX и HSL."
  position: "Позиция"
  clickToPickColor: "Нажмите в любом месте изображения, чтобы выбрать цвет"
  copy: "Копировать в буфер обмена"
de:
  toolName: "Bild-Farbwähler"
  description: "Kostenloser Online-Farbwähler für Bilder, keine Registrierung erforderlich. Unterstützt RGB-, HEX- und HSL-Formate."
  position: "Position"
  clickToPickColor: "Klicken Sie auf eine beliebige Stelle im Bild, um die Farbe auszuwählen"
  copy: "In die Zwischenablage kopieren"
</i18n>
