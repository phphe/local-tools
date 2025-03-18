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
        <div class="flex-1">
          <h3 class="text-sm mb-2">{{ t("preview") }}</h3>
          <div class="bg-gray-200 dark:bg-gray-700 p-2 rounded">
            <img
              :src="imageUrl"
              :style="{
                borderRadius: `${radius}px`,
              }"
              class="max-w-[300px] max-h-[300px] object-contain transition-all"
            />
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <span>{{ t("radius") }}:</span>
          <input type="range" v-model="radius" min="0" max="150" class="w-32" />
          <input
            type="number"
            v-model="radius"
            class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            min="0"
            max="150"
          />
          <span>px</span>
        </div>
        <Btn size="sm" @click="saveRound">{{ t("save") }}</Btn>
      </div>
    </div>
    <!-- 历史记录 -->
    <div v-if="roundHistory.length" class="mt-6">
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
                {{ t("radius") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in roundHistory"
              :key="item.timestamp"
              class="border-b border-gray-300 dark:border-gray-700"
            >
              <td
                class="py-2 px-4 border-r border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-700"
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
                {{ item.radius }}px
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
                  @click="roundHistory.splice(index, 1)"
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
const radius = ref(20);

interface RoundHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  radius: number;
  timestamp: number;
}

const roundHistory = ref<RoundHistory[]>([]);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
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

const saveRound = async () => {
  if (!imageRef.value || !currentFile.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = imageRef.value;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // 创建圆角路径
  ctx.beginPath();
  ctx.moveTo(radius.value, 0);
  ctx.lineTo(canvas.width - radius.value, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius.value);
  ctx.lineTo(canvas.width, canvas.height - radius.value);
  ctx.quadraticCurveTo(
    canvas.width,
    canvas.height,
    canvas.width - radius.value,
    canvas.height
  );
  ctx.lineTo(radius.value, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius.value);
  ctx.lineTo(0, radius.value);
  ctx.quadraticCurveTo(0, 0, radius.value, 0);
  ctx.closePath();

  // 设置透明背景
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fill();

  // 裁剪路径
  ctx.clip();

  // 绘制图片
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png"); // 使用 PNG 格式保持透明度
  });

  roundHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: currentFile.value.name,
    radius: radius.value,
    timestamp: Date.now(),
  });
};

const downloadImage = (item: RoundHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  const name = item.fileName.split(".");
  name.pop();
  a.href = url;
  a.download = `${name.join(".")}_round_${item.radius}px.png`; // 统一使用 PNG 格式
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  roundHistory.value.forEach((item) => {
    URL.revokeObjectURL(item.thumb);
  });
});
</script>

<i18n lang="yaml">
en:
  toolName: "Image Round Corner"
  description: "Online free round corner images, no upload and registration required."
  original: "Original"
  preview: "Preview"
  radius: "Radius"
  save: "Save"
  outputFiles: "Output Files"
  fileName: "File Name"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
zh:
  toolName: "图片圆角"
  description: "在线免费圆角化图片，无需上传和注册。"
  original: "原图"
  preview: "预览"
  radius: "圆角半径"
  save: "保存"
  outputFiles: "输出文件"
  fileName: "文件名"
  actions: "操作"
  download: "下载"
  delete: "删除"
es:
  toolName: "Esquinas Redondeadas"
  description: "Redondear esquinas de imágenes gratis en línea, sin necesidad de cargar ni registrarse."
  original: "Original"
  preview: "Vista Previa"
  radius: "Radio"
  save: "Guardar"
  outputFiles: "Archivos de Salida"
  fileName: "Nombre del Archivo"
  actions: "Acciones"
  download: "Descargar"
  delete: "Eliminar"
pt:
  toolName: "Cantos Arredondados"
  description: "Arredondar cantos de imagens online gratuitamente, sem necessidade de upload ou registro."
  original: "Original"
  preview: "Prévia"
  radius: "Raio"
  save: "Salvar"
  outputFiles: "Arquivos de Saída"
  fileName: "Nome do Arquivo"
  actions: "Ações"
  download: "Baixar"
  delete: "Excluir"
id:
  toolName: "Sudut Gambar Bulat"
  description: "Pembulatan sudut gambar online gratis, tanpa perlu unggah dan registrasi."
  original: "Asli"
  preview: "Pratinjau"
  radius: "Radius"
  save: "Simpan"
  outputFiles: "File Output"
  fileName: "Nama File"
  actions: "Tindakan"
  download: "Unduh"
  delete: "Hapus"
fr:
  toolName: "Coins Arrondis"
  description: "Arrondissement gratuit des coins d'images en ligne, sans téléchargement ni inscription."
  original: "Original"
  preview: "Aperçu"
  radius: "Rayon"
  save: "Enregistrer"
  outputFiles: "Fichiers de Sortie"
  fileName: "Nom du Fichier"
  actions: "Actions"
  download: "Télécharger"
  delete: "Supprimer"
ja:
  toolName: "画像の角丸め"
  description: "オンライン無料画像角丸めツール、アップロードや登録不要。"
  original: "原画像"
  preview: "プレビュー"
  radius: "半径"
  save: "保存"
  outputFiles: "出力ファイル"
  fileName: "ファイル名"
  actions: "操作"
  download: "ダウンロード"
  delete: "削除"
ru:
  toolName: "Скругление Углов"
  description: "Бесплатное онлайн-скругление углов изображений, без загрузки и регистрации."
  original: "Оригинал"
  preview: "Предпросмотр"
  radius: "Радиус"
  save: "Сохранить"
  outputFiles: "Выходные Файлы"
  fileName: "Имя Файла"
  actions: "Действия"
  download: "Скачать"
  delete: "Удалить"
de:
  toolName: "Abgerundete Ecken"
  description: "Kostenlose Online-Bildecken-Abrundung, ohne Upload und Registrierung."
  original: "Original"
  preview: "Vorschau"
  radius: "Radius"
  save: "Speichern"
  outputFiles: "Ausgabedateien"
  fileName: "Dateiname"
  actions: "Aktionen"
  download: "Herunterladen"
  delete: "Löschen"
</i18n>
