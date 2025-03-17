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
                opacity: opacity / 100,
              }"
              class="max-w-[300px] max-h-[300px] object-contain transition-opacity"
            />
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <span>{{ t("opacity") }}:</span>
          <input
            type="range"
            v-model="opacity"
            min="0"
            max="100"
            class="w-32"
          />
          <input
            type="number"
            v-model="opacity"
            class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
            min="0"
            max="100"
          />
          <span>%</span>
        </div>
        <Btn size="sm" @click="saveOpacity">{{ t("save") }}</Btn>
      </div>
    </div>
    <!-- 历史记录 -->
    <div v-if="opacityHistory.length" class="mt-6">
      <h2 class="text-lg mb-2">{{ t("outputFiles") }}</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700">
                {{ t("preview") }}
              </th>
              <th class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700">
                {{ t("fileName") }}
              </th>
              <th class="py-2 px-4 text-left border-r border-gray-300 dark:border-gray-700">
                {{ t("opacity") }}
              </th>
              <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in opacityHistory" :key="item.timestamp" 
              class="border-b border-gray-300 dark:border-gray-700">
              <td class="py-2 px-4 border-r border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
                <img :src="item.thumb" class="w-25 h-auto object-contain" />
              </td>
              <td class="py-2 px-4 border-r border-gray-300 dark:border-gray-700">
                {{ item.fileName }}
              </td>
              <td class="py-2 px-4 border-r border-gray-300 dark:border-gray-700">
                {{ item.opacity }}%
              </td>
              <td class="py-2 px-4">
                <Btn size="sm" color="primary" class="mr-2" @click="downloadImage(item)">
                  {{ t("download") }}
                </Btn>
                <Btn size="sm" color="danger" @click="opacityHistory.splice(index, 1)">
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
definePageMeta({
  keepalive: true
});

const { t } = useI18n({
  useScope: "local",
});

useHead({
  title: t("toolName"),
});

const currentFile = ref<File | null>(null);
const imageUrl = ref("");
const imageRef = ref<HTMLImageElement>();
const opacity = ref(100);

interface OpacityHistory {
  blob: Blob;
  thumb: string;
  fileName: string;
  opacity: number;
  timestamp: number;
}

const opacityHistory = ref<OpacityHistory[]>([]);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    imageSize.value = null;
    opacity.value = 100;

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

const saveOpacity = async () => {
  if (!imageRef.value || !currentFile.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = imageRef.value;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // 设置全局透明度
  ctx.globalAlpha = opacity.value / 100;
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png"); // 使用 PNG 格式保持透明度
  });

  opacityHistory.value.unshift({
    blob,
    thumb: URL.createObjectURL(blob),
    fileName: currentFile.value.name,
    opacity: opacity.value,
    timestamp: Date.now(),
  });
};

const downloadImage = (item: OpacityHistory) => {
  const url = URL.createObjectURL(item.blob);
  const a = document.createElement("a");
  const name = item.fileName.split(".");
  name.pop();
  a.href = url;
  a.download = `${name.join(".")}_opacity_${item.opacity}.png`; // 统一使用 PNG 格式
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  opacityHistory.value.forEach(item => {
    URL.revokeObjectURL(item.thumb);
  });
});
</script>

<i18n lang="yaml">
en:
  toolName: "Image Opacity"
  original: "Original"
  preview: "Preview"
  opacity: "Opacity"
  save: "Save"
  outputFiles: "Output Files"
  fileName: "File Name"
  actions: "Actions"
  download: "Download"
  delete: "Delete"
zh:
  toolName: "图片透明度"
  original: "原图"
  preview: "预览"
  opacity: "透明度"
  save: "保存"
  outputFiles: "输出文件"
  fileName: "文件名"
  actions: "操作"
  download: "下载"
  delete: "删除"
</i18n>