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
      <div class="mt-4">
        <img
          ref="imageRef"
          :src="imageUrl"
          :style="{
            transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
          }"
          class="max-w-[300px] max-h-[300px] object-contain transition-transform"
        />
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <Btn size="sm" @click="flipHorizontal">{{ t("flipHorizontal") }}</Btn>
        <Btn size="sm" @click="flipVertical">{{ t("flipVertical") }}</Btn>
        <Btn size="sm" @click="saveFlip">{{ t("save") }}</Btn>
      </div>
    </div>
    <!-- 历史记录 -->
    <div v-if="flipHistory.length" class="mt-6">
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
              <th
                class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700"
              >
                {{ t("flipType") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in flipHistory"
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
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700"
              >
                {{ item.flipType }}
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
                  @click="flipHistory.splice(index, 1)"
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

useHead({
  title: t("toolName"),
});

const currentFile = ref<File | null>(null);
const imageUrl = ref("");
const imageRef = ref<HTMLImageElement>();
const flipX = ref(false);
const flipY = ref(false);

interface FlipHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  flipType: string;
  timestamp: number;
}

const flipHistory = ref<FlipHistory[]>([]);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    imageSize.value = null;
    flipX.value = false;
    flipY.value = false;

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

const flipHorizontal = () => {
  flipX.value = !flipX.value;
};

const flipVertical = () => {
  flipY.value = !flipY.value;
};

const saveFlip = async () => {
  if (!imageRef.value || !currentFile.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = imageRef.value;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // 应用翻转
  ctx.scale(flipX.value ? -1 : 1, flipY.value ? -1 : 1);
  ctx.drawImage(
    img,
    flipX.value ? -canvas.width : 0,
    flipY.value ? -canvas.height : 0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!));
  });

  const flipType = [];
  if (flipX.value) flipType.push(t("horizontal"));
  if (flipY.value) flipType.push(t("vertical"));

  flipHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: currentFile.value.name,
    flipType: flipType.join(" + ") || t("none"),
    timestamp: Date.now(),
  });
};

const downloadImage = (item: FlipHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  const ext = item.fileName.split(".").pop() || "png";
  const flipType = item.flipType.toLowerCase().replace(" + ", "_");
  a.href = url;
  a.download = `${item.fileName.split(".")[0]}_flipped.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  flipHistory.value.forEach((item) => {
    URL.revokeObjectURL(item.thumb);
  });
});
</script>

<i18n lang="yaml">
en:
  toolName: "Image Flip"
  description: "Online free image flip tool, no upload and registration required."
  flipHorizontal: "Flip Horizontal"
  flipVertical: "Flip Vertical"
  save: "Save"
  outputFiles: "Output Files"
  preview: "Preview"
  fileName: "File Name"
  flipType: "Flip Type"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
  horizontal: "Horizontal"
  vertical: "Vertical"
  none: "None"
zh:
  toolName: "图片翻转"
  description: "在线免费翻转图片，镜像图片，无需上传和注册。"
  flipHorizontal: "水平翻转"
  flipVertical: "垂直翻转"
  save: "保存"
  outputFiles: "输出文件"
  preview: "预览"
  fileName: "文件名"
  flipType: "翻转类型"
  actions: "操作"
  download: "下载"
  delete: "删除"
  horizontal: "水平"
  vertical: "垂直"
  none: "无"
es:
  toolName: "Voltear Imagen"
  description: "Herramienta gratuita para voltear imágenes en línea, sin necesidad de cargar ni registrarse."
  flipHorizontal: "Voltear Horizontal"
  flipVertical: "Voltear Vertical"
  save: "Guardar"
  outputFiles: "Archivos de Salida"
  preview: "Vista Previa"
  fileName: "Nombre del Archivo"
  flipType: "Tipo de Volteo"
  actions: "Acciones"
  download: "Descargar"
  delete: "Eliminar"
  horizontal: "Horizontal"
  vertical: "Vertical"
  none: "Ninguno"
pt:
  toolName: "Inverter Imagem"
  description: "Ferramenta gratuita para inverter imagens online, sem necessidade de upload ou registro."
  flipHorizontal: "Inverter Horizontal"
  flipVertical: "Inverter Vertical"
  save: "Salvar"
  outputFiles: "Arquivos de Saída"
  preview: "Prévia"
  fileName: "Nome do Arquivo"
  flipType: "Tipo de Inversão"
  actions: "Ações"
  download: "Baixar"
  delete: "Excluir"
  horizontal: "Horizontal"
  vertical: "Vertical"
  none: "Nenhum"
id:
  toolName: "Balik Gambar"
  description: "Alat pembalik gambar online gratis, tanpa perlu unggah dan registrasi."
  flipHorizontal: "Balik Horizontal"
  flipVertical: "Balik Vertikal"
  save: "Simpan"
  outputFiles: "File Output"
  preview: "Pratinjau"
  fileName: "Nama File"
  flipType: "Tipe Pembalikan"
  actions: "Tindakan"
  download: "Unduh"
  delete: "Hapus"
  horizontal: "Horizontal"
  vertical: "Vertikal"
  none: "Tidak Ada"
fr:
  toolName: "Retourner l'Image"
  description: "Outil gratuit de retournement d'image en ligne, sans téléchargement ni inscription."
  flipHorizontal: "Retourner Horizontalement"
  flipVertical: "Retourner Verticalement"
  save: "Enregistrer"
  outputFiles: "Fichiers de Sortie"
  preview: "Aperçu"
  fileName: "Nom du Fichier"
  flipType: "Type de Retournement"
  actions: "Actions"
  download: "Télécharger"
  delete: "Supprimer"
  horizontal: "Horizontal"
  vertical: "Vertical"
  none: "Aucun"
ja:
  toolName: "画像反転"
  description: "オンライン無料画像反転ツール、アップロードや登録不要。"
  flipHorizontal: "水平反転"
  flipVertical: "垂直反転"
  save: "保存"
  outputFiles: "出力ファイル"
  preview: "プレビュー"
  fileName: "ファイル名"
  flipType: "反転タイプ"
  actions: "操作"
  download: "ダウンロード"
  delete: "削除"
  horizontal: "水平"
  vertical: "垂直"
  none: "なし"
ru:
  toolName: "Отражение Изображения"
  description: "Бесплатный онлайн-инструмент для отражения изображений, без загрузки и регистрации."
  flipHorizontal: "Отразить Горизонтально"
  flipVertical: "Отразить Вертикально"
  save: "Сохранить"
  outputFiles: "Выходные Файлы"
  preview: "Предпросмотр"
  fileName: "Имя Файла"
  flipType: "Тип Отражения"
  actions: "Действия"
  download: "Скачать"
  delete: "Удалить"
  horizontal: "Горизонтально"
  vertical: "Вертикально"
  none: "Нет"
de:
  toolName: "Bild Spiegeln"
  description: "Kostenloses Online-Tool zum Spiegeln von Bildern, ohne Upload und Registrierung."
  flipHorizontal: "Horizontal Spiegeln"
  flipVertical: "Vertikal Spiegeln"
  save: "Speichern"
  outputFiles: "Ausgabedateien"
  preview: "Vorschau"
  fileName: "Dateiname"
  flipType: "Spiegelungstyp"
  actions: "Aktionen"
  download: "Herunterladen"
  delete: "Löschen"
  horizontal: "Horizontal"
  vertical: "Vertikal"
  none: "Keine"
</i18n>
