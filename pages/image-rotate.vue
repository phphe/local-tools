<template>
  <div class="mt-4">
    <h1 class="text-2xl">{{ t("toolName") }}</h1>
    <div class="mt-4">
      <FileInput
        accept="image/*"
        acceptDescription="jpg,png,gif,webp,jpeg,bmp,svg,tiff,ico"
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
      <div
        class="mt-4 w-[310px] h-[310px] p-[10px] rounded flex items-center justify-center border border-gray-300 dark:border-gray-700"
      >
        <img
          ref="imageRef"
          :src="imageUrl"
          :style="{ transform: `rotate(${rotation}deg)` }"
          class="max-w-[300px] max-h-[300px] object-contain transition-transform"
        />
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <Btn size="sm" @click="rotate(-90)">{{ t("rotateLeft") }}</Btn>
        <Btn size="sm" @click="rotate(90)">{{ t("rotateRight") }}</Btn>
        <div class="flex items-center gap-2">
          <span>{{ t("angle") }}:</span>
          <input
            type="number"
            v-model="rotation"
            class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            step="1"
          />
        </div>
        <Btn size="sm" @click="saveRotation">{{ t("save") }}</Btn>
      </div>
    </div>
    <!-- 历史记录 -->
    <div v-if="rotateHistory.length" class="mt-6">
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
                {{ t("angle") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in rotateHistory"
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
                {{ item.angle }}°
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
                  @click="rotateHistory.splice(index, 1)"
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
const imageRef = ref<HTMLImageElement>();
const rotation = ref(0);

interface RotateHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  angle: number;
  timestamp: number;
}

const rotateHistory = ref<RotateHistory[]>([]);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    imageSize.value = null;
    rotation.value = 0;

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

const rotate = (angle: number) => {
  rotation.value = (rotation.value + angle) % 360;
};

const saveRotation = async () => {
  if (!imageRef.value || !currentFile.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // 根据旋转角度调整画布大小
  const angle = (rotation.value * Math.PI) / 180;
  const img = imageRef.value;
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // 计算旋转后的画布尺寸
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));
  canvas.width = Math.floor(w * cos + h * sin);
  canvas.height = Math.floor(w * sin + h * cos);

  // 移动到画布中心并旋转
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!));
  });

  rotateHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: currentFile.value.name,
    angle: rotation.value,
    timestamp: Date.now(),
  });
};

const downloadImage = (item: RotateHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  const ext = item.fileName.split(".").pop() || "png";
  a.href = url;
  a.download = `${item.fileName.split(".")[0]}_${item.angle}deg.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>

<i18n lang="yaml">
en:
  toolName: "Image Rotator"
  description: "Online free image rotation, no need to upload and register."
  rotateLeft: "Rotate Left"
  rotateRight: "Rotate Right"
  angle: "Angle"
  save: "Save"
  outputFiles: "Output Files"
  preview: "Preview"
  fileName: "File Name"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
zh:
  toolName: "图片旋转"
  description: "在线免费旋转图片，无需上传和注册。"
  rotateLeft: "向左旋转"
  rotateRight: "向右旋转"
  angle: "角度"
  save: "保存"
  outputFiles: "输出文件"
  preview: "预览"
  fileName: "文件名"
  actions: "操作"
  download: "下载"
  delete: "删除"
es:
  toolName: "Rotador de Imágenes"
  description: "Rotación gratuita de imágenes en línea, sin necesidad de cargar ni registrarse."
  rotateLeft: "Rotar a la Izquierda"
  rotateRight: "Rotar a la Derecha"
  angle: "Ángulo"
  save: "Guardar"
  outputFiles: "Archivos de Salida"
  preview: "Vista Previa"
  fileName: "Nombre del Archivo"
  actions: "Acciones"
  download: "Descargar"
  delete: "Eliminar"
pt:
  toolName: "Rotacionador de Imagem"
  description: "Rotação gratuita de imagem online, sem necessidade de upload ou registro."
  rotateLeft: "Girar à Esquerda"
  rotateRight: "Girar à Direita"
  angle: "Ângulo"
  save: "Salvar"
  outputFiles: "Arquivos de Saída"
  preview: "Prévia"
  fileName: "Nome do Arquivo"
  actions: "Ações"
  download: "Baixar"
  delete: "Excluir"
id:
  toolName: "Pemutar Gambar"
  description: "Pemutaran gambar online gratis, tanpa perlu unggah dan registrasi."
  rotateLeft: "Putar ke Kiri"
  rotateRight: "Putar ke Kanan"
  angle: "Sudut"
  save: "Simpan"
  outputFiles: "File Output"
  preview: "Pratinjau"
  fileName: "Nama File"
  actions: "Tindakan"
  download: "Unduh"
  delete: "Hapus"
fr:
  toolName: "Rotateur d'Image"
  description: "Rotation d'images gratuite en ligne, sans téléchargement ni inscription."
  rotateLeft: "Rotation à Gauche"
  rotateRight: "Rotation à Droite"
  angle: "Angle"
  save: "Enregistrer"
  outputFiles: "Fichiers de Sortie"
  preview: "Aperçu"
  fileName: "Nom du Fichier"
  actions: "Actions"
  download: "Télécharger"
  delete: "Supprimer"
ja:
  toolName: "画像回転"
  description: "オンライン無料画像回転ツール、アップロードや登録不要。"
  rotateLeft: "左に回転"
  rotateRight: "右に回転"
  angle: "角度"
  save: "保存"
  outputFiles: "出力ファイル"
  preview: "プレビュー"
  fileName: "ファイル名"
  actions: "操作"
  download: "ダウンロード"
  delete: "削除"
ru:
  toolName: "Поворот Изображения"
  description: "Бесплатный онлайн-поворот изображений, без загрузки и регистрации."
  rotateLeft: "Повернуть Влево"
  rotateRight: "Повернуть Вправо"
  angle: "Угол"
  save: "Сохранить"
  outputFiles: "Выходные Файлы"
  preview: "Предпросмотр"
  fileName: "Имя Файла"
  actions: "Действия"
  download: "Скачать"
  delete: "Удалить"
de:
  toolName: "Bilddrehung"
  description: "Kostenlose Online-Bilddrehung, ohne Upload und Registrierung."
  rotateLeft: "Nach Links Drehen"
  rotateRight: "Nach Rechts Drehen"
  angle: "Winkel"
  save: "Speichern"
  outputFiles: "Ausgabedateien"
  preview: "Vorschau"
  fileName: "Dateiname"
  actions: "Aktionen"
  download: "Herunterladen"
  delete: "Löschen"
</i18n>
