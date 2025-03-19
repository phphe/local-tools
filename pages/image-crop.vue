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
      <div class="mt-4 relative">
        <img ref="imageRef" :src="imageUrl" class="max-w-full" />
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap" ref="btnNavRef">
        <Btn size="sm" @click="crop">{{ t("crop") }}</Btn>
        <div class="flex items-center gap-2">
          <input
            type="number"
            v-model="cropWidth"
            class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            @input="updateCropBox"
          />
          <span>&times;</span>
          <input
            type="number"
            v-model="cropHeight"
            class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            @input="updateCropBox"
          />
          <label class="flex items-center gap-1 ml-2">
            <input type="checkbox" v-model="lockRatio" class="rounded" />
            <span>{{ t("lockRatio") }}</span>
          </label>
        </div>
      </div>
    </div>
    <!-- 裁剪历史 -->
    <div v-if="cropHistory.length" class="mt-6" ref="historyRef">
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
              v-for="(item, index) in cropHistory"
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
                {{ item.width }}x{{ item.height }}
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
                  @click="cropHistory.splice(index, 1)"
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
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

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
const btnNavRef = ref<HTMLDivElement>();
const historyRef = ref<HTMLDivElement>();
let cropper: Cropper | null = null;

interface CropHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  width: number;
  height: number;
  timestamp: number;
}

const cropHistory = ref<CropHistory[]>([]);

const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    imageSize.value = null;

    // 获取图片尺寸
    const img = new Image();
    img.onload = () => {
      imageSize.value = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };
    };
    img.src = imageUrl.value;

    // 销毁旧的 cropper 实例
    if (cropper) {
      cropper.destroy();
    }

    // 等待图片加载完成后初始化 cropper
    nextTick(() => {
      if (imageRef.value) {
        cropper = new Cropper(imageRef.value, {
          aspectRatio: NaN, // 自由比例
          viewMode: 1,
          background: false,
          autoCropArea: 0.8,
          ready() {
            const data = cropper!.getData();
            cropWidth.value = Math.round(data.width);
            cropHeight.value = Math.round(data.height);
            aspectRatio.value = data.width / data.height;
            btnNavRef.value?.scrollIntoView({ behavior: "smooth" });
          },
          cropend() {
            const data = cropper!.getData();
            cropWidth.value = Math.round(data.width);
            cropHeight.value = Math.round(data.height);
          },
        });
      }
    });
  }
};

const crop = async () => {
  if (!cropper || !currentFile.value) return;

  const canvas = cropper.getCroppedCanvas();
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!));
  });

  cropHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: currentFile.value.name,
    width: canvas.width,
    height: canvas.height,
    timestamp: Date.now(),
  });
  nextTick(() => {
    historyRef.value?.scrollIntoView({ behavior: "smooth" });
  });
};

const downloadImage = (item: CropHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  const ext = item.fileName.split(".").pop() || "png";
  a.href = url;
  a.download = `${item.fileName.split(".")[0]}_${item.width}x${
    item.height
  }.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onUnmounted(() => {
  if (cropper) {
    cropper.destroy();
  }
});

const cropWidth = ref(0);
const cropHeight = ref(0);
const lockRatio = ref(false);
let aspectRatio = ref(1);

// 更新裁剪框尺寸
const updateCropBox = (e: Event) => {
  if (!cropper) return;

  const target = e.target as HTMLInputElement;
  const isWidth = target.value === cropWidth.value.toString();

  if (lockRatio.value) {
    if (isWidth) {
      cropHeight.value = Math.round(
        Number(cropWidth.value) / aspectRatio.value
      );
    } else {
      cropWidth.value = Math.round(
        Number(cropHeight.value) * aspectRatio.value
      );
    }
  }

  const data = cropper.getData();
  data.width = Number(cropWidth.value);
  data.height = Number(cropHeight.value);
  cropper.setData(data);
};

// 监听锁定比例变化
watch(lockRatio, (val) => {
  if (cropper) {
    if (val) {
      const restore = backupWidthHeight();
      aspectRatio.value = cropWidth.value / cropHeight.value;
      cropper.setAspectRatio(aspectRatio.value);
      restore();
    } else {
      const restore = backupWidthHeight();
      cropper.setAspectRatio(NaN);
      restore();
    }
  }
});

const backupWidthHeight = () => {
  const data = cropper!.getData();
  const width0 = data.width;
  const height0 = data.height;
  return () => {
    data.width = width0;
    data.height = height0;
    cropper!.setData(data);
  };
};
</script>

<i18n lang="yaml">
en:
  preview: "Preview"
  toolName: "Image Cropper"
  description: "Online free image cropping, no upload and registration required."
  crop: "Crop"
  outputFiles: "Output Files"
  fileName: "File Name"
  size: "Size"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
  lockRatio: "Lock Ratio"
zh:
  preview: "预览"
  toolName: "图片裁剪"
  description: "在线免费裁剪图片，无需上传和注册。"
  crop: "裁剪"
  outputFiles: "输出文件"
  fileName: "文件名"
  size: "尺寸"
  actions: "操作"
  download: "下载"
  delete: "删除"
  lockRatio: "锁定比例"
es:
  preview: "Vista Previa"
  toolName: "Recortador de Imágenes"
  description: "Recorte de imágenes gratuito en línea, sin necesidad de cargar ni registrarse."
  crop: "Recortar"
  outputFiles: "Archivos de Salida"
  fileName: "Nombre del Archivo"
  size: "Tamaño"
  actions: "Acciones"
  download: "Descargar"
  delete: "Eliminar"
  lockRatio: "Bloquear Proporción"
pt:
  preview: "Prévia"
  toolName: "Cortador de Imagem"
  description: "Recorte de imagem online gratuito, sem necessidade de upload ou registro."
  crop: "Cortar"
  outputFiles: "Arquivos de Saída"
  fileName: "Nome do Arquivo"
  size: "Tamanho"
  actions: "Ações"
  download: "Baixar"
  delete: "Excluir"
  lockRatio: "Travar Proporção"
id:
  preview: "Pratinjau"
  toolName: "Pemotong Gambar"
  description: "Alat pemotong gambar online gratis, tanpa perlu unggah dan registrasi."
  crop: "Potong"
  outputFiles: "File Output"
  fileName: "Nama File"
  size: "Ukuran"
  actions: "Tindakan"
  download: "Unduh"
  delete: "Hapus"
  lockRatio: "Kunci Rasio"
fr:
  preview: "Aperçu"
  toolName: "Recadrage d'Image"
  description: "Recadrage d'image gratuit en ligne, sans téléchargement ni inscription."
  crop: "Recadrer"
  outputFiles: "Fichiers de Sortie"
  fileName: "Nom du Fichier"
  size: "Taille"
  actions: "Actions"
  download: "Télécharger"
  delete: "Supprimer"
  lockRatio: "Verrouiller le Ratio"
ja:
  preview: "プレビュー"
  toolName: "画像トリミング"
  description: "オンライン無料画像トリミング、アップロードや登録不要。"
  crop: "トリミング"
  outputFiles: "出力ファイル"
  fileName: "ファイル名"
  size: "サイズ"
  actions: "操作"
  download: "ダウンロード"
  delete: "削除"
  lockRatio: "比率をロック"
ru:
  preview: "Предпросмотр"
  toolName: "Обрезка Изображений"
  description: "Бесплатная онлайн-обрезка изображений, без загрузки и регистрации."
  crop: "Обрезать"
  outputFiles: "Выходные Файлы"
  fileName: "Имя Файла"
  size: "Размер"
  actions: "Действия"
  download: "Скачать"
  delete: "Удалить"
  lockRatio: "Зафиксировать Пропорции"
de:
  preview: "Vorschau"
  toolName: "Bildzuschnitt"
  description: "Kostenloses Online-Bildzuschneiden, ohne Upload und Registrierung."
  crop: "Zuschneiden"
  outputFiles: "Ausgabedateien"
  fileName: "Dateiname"
  size: "Größe"
  actions: "Aktionen"
  download: "Herunterladen"
  delete: "Löschen"
  lockRatio: "Seitenverhältnis Sperren"
</i18n>
