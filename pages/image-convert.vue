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
          class="max-w-[300px] max-h-[300px] object-contain"
        />
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <select
          v-model="targetFormat"
          class="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WebP</option>
          <option value="image/gif">GIF</option>
        </select>
        <!-- 添加质量选项 -->
        <div
          v-if="['image/jpeg', 'image/webp'].includes(targetFormat)"
          class="flex items-center gap-1"
        >
          <span>{{ t("quality") }}:</span>
          <input
            type="number"
            v-model="quality"
            class="w-16 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            min="1"
            max="100"
          />
        </div>
        <Btn size="sm" @click="convert">{{ t("convert") }}</Btn>
      </div>
    </div>
    <!-- 转换历史 -->
    <div v-if="convertHistory.length" class="mt-6">
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
                {{ t("format") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in convertHistory"
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
                {{ item.format.toUpperCase() }}
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
                  @click="convertHistory.splice(index, 1)"
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
const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("toolName"),
});

const currentFile = ref<File | null>(null);
const imageUrl = ref("");
const imageRef = ref<HTMLImageElement>();
const targetFormat = ref("image/png");

interface ConvertHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  format: string;
  width: number;
  height: number;
  timestamp: number;
}

const convertHistory = ref<ConvertHistory[]>([]);
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

const quality = ref(92); // 默认质量值

const convert = async () => {
  if (!imageRef.value || !currentFile.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = imageRef.value.naturalWidth;
  canvas.height = imageRef.value.naturalHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageRef.value, 0, 0);

  const blob = await new Promise<Blob>((resolve) => {
    const options: any = {};

    // 设置质量选项
    if (["image/jpeg", "image/webp"].includes(targetFormat.value)) {
      options.quality = quality.value / 100;
    }

    canvas.toBlob((blob) => resolve(blob!), targetFormat.value, options);
  });

  const format = targetFormat.value.split("/")[1];
  convertHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: `${currentFile.value.name.split(".")[0]}.${format}`,
    format,
    width: canvas.width,
    height: canvas.height,
    timestamp: Date.now(),
  });
};

const downloadImage = (item: ConvertHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = item.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const checkBrowserSupport = () => {
  const requirements = {
    canvas: !!document.createElement("canvas").getContext,
    blob: "Blob" in window,
  };

  return Object.values(requirements).every((supported) => supported);
};

onMounted(() => {
  if (!checkBrowserSupport()) {
    alert(t("browserNotSupported"));
  }
});
</script>

<i18n lang="yaml">
en:
  toolName: "Image Format Converter"
  convert: "Convert"
  outputFiles: "Output Files"
  preview: "Preview"
  fileName: "File Name"
  format: "Format"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
  quality: "Quality"
zh:
  toolName: "图片格式转换"
  convert: "转换"
  outputFiles: "输出文件"
  preview: "预览"
  fileName: "文件名"
  format: "格式"
  actions: "操作"
  download: "下载"
  delete: "删除"
  quality: "质量"
</i18n>
