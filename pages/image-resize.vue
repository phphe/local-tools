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
          <img ref="imageRef" :src="imageUrl" class="max-w-[300px] max-h-[300px] object-contain" />
        </div>
        <div class="mt-4 space-y-4">
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model="targetWidth"
              class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              @input="handleWidthChange"
              min="1"
            />
            <span>&times;</span>
            <input
              type="number"
              v-model="targetHeight"
              class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              @input="handleHeightChange"
              min="1"
            />
            <label class="flex items-center gap-1 ml-2">
              <input type="checkbox" v-model="lockRatio" class="rounded" />
              <span>{{ t("lockRatio") }}</span>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <Btn size="sm" @click="resize">{{ t("resize") }}</Btn>
          </div>
        </div>
      </div>
      <!-- 历史记录 -->
      <div v-if="resizeHistory.length" class="mt-6">
        <h2 class="text-lg mb-2">{{ t("resizeHistory") }}</h2>
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
                  {{ t("size") }}
                </th>
                <th class="py-2 px-4 text-left">{{ t("actions") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in resizeHistory" :key="item.timestamp" 
                class="border-b border-gray-300 dark:border-gray-700">
                <td class="py-2 px-4 border-r border-gray-300 dark:border-gray-700">
                  <img :src="item.thumb" class="w-25 h-auto object-contain" />
                </td>
                <td class="py-2 px-4 border-r border-gray-300 dark:border-gray-700">
                  {{ item.fileName }}
                </td>
                <td class="py-2 px-4 border-r border-gray-300 dark:border-gray-700">
                  {{ item.width }}x{{ item.height }}
                </td>
                <td class="py-2 px-4">
                  <Btn size="sm" color="primary" class="mr-2" @click="downloadImage(item)">
                    {{ t("download") }}
                  </Btn>
                  <Btn size="sm" color="danger" @click="resizeHistory.splice(index, 1)">
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
  const targetWidth = ref(0);
  const targetHeight = ref(0);
  const lockRatio = ref(true);
  const aspectRatio = ref(1);
  
  interface ResizeHistory {
    blob: Blob;
    thumb: string;
    fileName: string;
    width: number;
    height: number;
    timestamp: number;
  }
  
  const resizeHistory = ref<ResizeHistory[]>([]);
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
        targetWidth.value = img.naturalWidth;
        targetHeight.value = img.naturalHeight;
        aspectRatio.value = img.naturalWidth / img.naturalHeight;
      };
      img.src = imageUrl.value;
    }
  };
  
  const handleWidthChange = () => {
    if (lockRatio.value && targetWidth.value > 0) {
      targetHeight.value = Math.round(targetWidth.value / aspectRatio.value);
    }
  };
  
  const handleHeightChange = () => {
    if (lockRatio.value && targetHeight.value > 0) {
      targetWidth.value = Math.round(targetHeight.value * aspectRatio.value);
    }
  };
  
  const resize = async () => {
    if (!imageRef.value || !currentFile.value) return;
  
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth.value;
    canvas.height = targetHeight.value;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageRef.value, 0, 0, targetWidth.value, targetHeight.value);
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!));
    });
  
    resizeHistory.value.unshift({
      blob,
      thumb: URL.createObjectURL(blob),
      fileName: currentFile.value.name,
      width: targetWidth.value,
      height: targetHeight.value,
      timestamp: Date.now(),
    });
  };
  
  const downloadImage = (item: ResizeHistory) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a");
    const ext = item.fileName.split(".").pop() || "png";
    a.href = url;
    a.download = `${item.fileName.split(".")[0]}_${item.width}x${item.height}.${ext}`;
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
    toolName: "Image Resizer"
    resize: "Resize"
    resizeHistory: "Resize History"
    preview: "Preview"
    fileName: "File Name"
    size: "Size"
    actions: "Actions"
    download: "Download"
    delete: "Delete"
    lockRatio: "Lock Ratio"
  zh:
    toolName: "图片尺寸调整"
    resize: "调整尺寸"
    resizeHistory: "调整历史"
    preview: "预览"
    fileName: "文件名"
    size: "尺寸"
    actions: "操作"
    download: "下载"
    delete: "删除"
    lockRatio: "锁定比例"
  </i18n>