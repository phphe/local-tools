<template>
  <div class="mt-4">
    <h1 class="text-2xl">{{ t("toolName") }}</h1>
    <div class="mt-4">
      <FileInput accept="image/*" @change="handleFileChange" />
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
          <h3 class="text-sm mb-2">{{ t("original") }}</h3>
          <img
            ref="imageRef"
            :src="imageUrl"
            class="max-w-[300px] max-h-[300px] object-contain"
          />
        </div>
        <div class="flex-1" v-if="previewUrl">
          <h3 class="text-sm mb-2">{{ t("preview") }}</h3>
          <img
            :src="previewUrl"
            class="max-w-[300px] max-h-[300px] object-contain"
          />
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <Btn size="sm" @click="convertToGrayscale">{{ t("convert") }}</Btn>
        <Btn size="sm" @click="saveGrayscale" v-if="previewUrl">{{
          t("save")
        }}</Btn>
      </div>
    </div>
    <!-- 历史记录 -->
    <div v-if="grayscaleHistory.length" class="mt-6">
      <h2 class="text-lg mb-2">{{ t("outputFiles") }}</h2>
      <div class="overflow-x-auto">
        <table
          class="min-w-full border-collapse border border-gray-300 dark:border-gray-700"
        >
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("preview") }}
              </th>
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("fileName") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in grayscaleHistory"
              :key="item.timestamp"
              class="border-b border-gray-300 dark:border-gray-700"
            >
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                <img :src="item.thumb" class="w-25 h-auto object-contain" />
              </td>
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                {{ item.fileName }}
              </td>
              <td class="py-2 px-4">
                <Btn
                  size="sm"
                  color="primary"
                  class="mr-2"
                  @click="downloadImage(item)"
                >
                  {{ t("download") }}
                </Btn>
                <Btn
                  size="sm"
                  color="danger"
                  @click="grayscaleHistory.splice(index, 1)"
                >
                  {{ t("delete") }}
                </Btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
const previewUrl = ref("");
const imageRef = ref<HTMLImageElement>();

interface GrayscaleHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  timestamp: number;
}

const grayscaleHistory = ref<GrayscaleHistory[]>([]);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    previewUrl.value = "";
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

const convertToGrayscale = async () => {
  if (!imageRef.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = imageRef.value;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // 绘制原图
  ctx.drawImage(img, 0, 0);

  // 获取图像数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 转换为灰度
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // 更新图像
  ctx.putImageData(imageData, 0, 0);

  // 创建预览
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!));
  });
  previewUrl.value = URL.createObjectURL(blob);
};

const saveGrayscale = async () => {
  if (!imageRef.value || !currentFile.value || !previewUrl.value) return;

  const response = await fetch(previewUrl.value);
  const blob = await response.blob();

  grayscaleHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: currentFile.value.name,
    timestamp: Date.now(),
  });
};

const downloadImage = (item: GrayscaleHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  const ext = item.fileName.split(".").pop() || "png";
  a.href = url;
  a.download = `${item.fileName.split(".")[0]}_grayscale.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  grayscaleHistory.value.forEach((item) => {
    URL.revokeObjectURL(item.thumb);
  });
});
</script>

<i18n lang="yaml">
en:
  toolName: "Image Grayscale"
  description: "Online free image grayscale conversion, no upload and registration required."
  original: "Original"
  preview: "Preview"
  convert: "Convert to Grayscale"
  save: "Save"
  outputFiles: "Output Files"
  fileName: "File Name"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
zh:
  toolName: "图片转灰度图"
  description: "在线免费生成图片灰度图，无需上传和注册。"
  original: "原图"
  preview: "预览"
  convert: "转换为灰度"
  save: "保存"
  outputFiles: "输出文件"
  fileName: "文件名"
  actions: "操作"
  download: "下载"
  delete: "删除"
es:
  toolName: "Escala de Grises"
  description: "Conversión gratuita de imágenes a escala de grises en línea, sin necesidad de cargar ni registrarse."
  original: "Original"
  preview: "Vista Previa"
  convert: "Convertir a Escala de Grises"
  save: "Guardar"
  outputFiles: "Archivos de Salida"
  fileName: "Nombre del Archivo"
  actions: "Acciones"
  download: "Descargar"
  delete: "Eliminar"
pt:
  toolName: "Escala de Cinza"
  description: "Conversão gratuita de imagem para escala de cinza online, sem necessidade de upload ou registro."
  original: "Original"
  preview: "Prévia"
  convert: "Converter para Escala de Cinza"
  save: "Salvar"
  outputFiles: "Arquivos de Saída"
  fileName: "Nome do Arquivo"
  actions: "Ações"
  download: "Baixar"
  delete: "Excluir"
id:
  toolName: "Skala Abu-abu"
  description: "Konversi gambar skala abu-abu online gratis, tanpa perlu unggah dan registrasi."
  original: "Asli"
  preview: "Pratinjau"
  convert: "Ubah ke Skala Abu-abu"
  save: "Simpan"
  outputFiles: "File Output"
  fileName: "Nama File"
  actions: "Tindakan"
  download: "Unduh"
  delete: "Hapus"
fr:
  toolName: "Niveaux de Gris"
  description: "Conversion gratuite d'images en niveaux de gris en ligne, sans téléchargement ni inscription."
  original: "Original"
  preview: "Aperçu"
  convert: "Convertir en Niveaux de Gris"
  save: "Enregistrer"
  outputFiles: "Fichiers de Sortie"
  fileName: "Nom du Fichier"
  actions: "Actions"
  download: "Télécharger"
  delete: "Supprimer"
ja:
  toolName: "グレースケール"
  description: "オンライン無料画像グレースケール変換、アップロードや登録不要。"
  original: "原画像"
  preview: "プレビュー"
  convert: "グレースケールに変換"
  save: "保存"
  outputFiles: "出力ファイル"
  fileName: "ファイル名"
  actions: "操作"
  download: "ダウンロード"
  delete: "削除"
ru:
  toolName: "Оттенки Серого"
  description: "Бесплатное онлайн-преобразование изображений в оттенки серого, без загрузки и регистрации."
  original: "Оригинал"
  preview: "Предпросмотр"
  convert: "Преобразовать в Оттенки Серого"
  save: "Сохранить"
  outputFiles: "Выходные Файлы"
  fileName: "Имя Файла"
  actions: "Действия"
  download: "Скачать"
  delete: "Удалить"
de:
  toolName: "Graustufen"
  description: "Kostenlose Online-Umwandlung von Bildern in Graustufen, ohne Upload und Registrierung."
  original: "Original"
  preview: "Vorschau"
  convert: "In Graustufen Umwandeln"
  save: "Speichern"
  outputFiles: "Ausgabedateien"
  fileName: "Dateiname"
  actions: "Aktionen"
  download: "Herunterladen"
  delete: "Löschen"
</i18n>
