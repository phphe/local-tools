<template>
  <div class="mt-4">
    <h1 class="text-2xl">{{ t("toolName") }}</h1>
    <div class="mt-4">
      <FileInput accept="image/*" @change="handleFileChange" />
    </div>
    <div class="mt-4">
      <template v-if="currentFile">
        <h2 class="text-lg">
          {{ currentFile.name }}
          <span
            class="text-sm text-gray-500 dark:text-gray-400"
            v-if="imageSize"
          >
            ({{ imageSize.width }}x{{ imageSize.height }})
          </span>
        </h2>
        <div class="mt-4 relative">
          <img ref="imageRef" :src="imageUrl" class="max-w-full" />
        </div>
      </template>
      <div class="mt-4 space-y-2">
        <div class="font-medium">{{ t("selectTargets") }}:</div>
        <div class="space-y-1">
          <label
            v-for="target in targets"
            :key="target.name"
            class="flex items-center gap-2"
          >
            <input type="checkbox" v-model="target.selected" class="rounded" />
            <span>{{ target.label }}</span>
          </label>
        </div>
      </div>
      <div class="mt-4">
        <Btn
          size="sm"
          @click="generate"
          :loading="generating"
          :disabled="!hasSelectedTargets || !currentFile"
        >
          {{ t("generate") }}
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Cropper from "cropperjs";
import JSZip from "jszip";
import "cropperjs/dist/cropper.css";

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
const generating = ref(false);
let cropper: Cropper | null = null;

const imageSize = ref<{ width: number; height: number } | null>(null);

// 定义输出目标
const targets = ref([
  {
    name: "favicon_ico16",
    label: "16x16 (favicon.ico)",
    selected: false,
    sizes: [16, 16],
    format: "ico",
  },
  {
    name: "favicon_ico32",
    label: "32x32 (favicon.ico)",
    selected: true,
    sizes: [32, 32],
    format: "ico",
  },
  {
    name: "favicon_ico48",
    label: "48x48 (favicon.ico)",
    selected: false,
    sizes: [48, 48],
    format: "ico",
  },
  {
    name: "favicon_png16",
    label: "16x16 (favicon.png)",
    selected: false,
    sizes: [16, 16],
    format: "png",
  },
  {
    name: "favicon_png32",
    label: "32x32 (favicon.png)",
    selected: false,
    sizes: [32, 32],
    format: "png",
  },
  {
    name: "favicon_png48",
    label: "48x48 (favicon.png)",
    selected: false,
    sizes: [48, 48],
    format: "png",
  },
  {
    name: "favicon_png64",
    label: "64x64 (favicon.png)",
    selected: false,
    sizes: [64, 64],
    format: "png",
  },
  {
    name: "apple",
    label: "180x180 (apple-touch-icon.png)",
    selected: false,
    sizes: [180, 180],
    format: "png",
  },
  {
    name: "android_192",
    label: "192x192 (android-chrome.png)",
    selected: false,
    sizes: [192, 192],
    format: "png",
  },
  {
    name: "android_512",
    label: "512x512 (android-chrome.png)",
    selected: false,
    sizes: [512, 512],
    format: "png",
  },
  {
    name: "windows",
    label: "270x270 (mstile-150x150.png)",
    selected: false,
    sizes: [270, 270],
    format: "png",
  },
]);

const hasSelectedTargets = computed(() =>
  targets.value.some((t) => t.selected)
);

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

    if (cropper) {
      cropper.destroy();
    }

    nextTick(() => {
      if (imageRef.value) {
        cropper = new Cropper(imageRef.value, {
          aspectRatio: 1,
          viewMode: 1,
          background: false,
          autoCropArea: 1,
          cropBoxResizable: true, // 允许调整裁剪框大小
          cropBoxMovable: true, // 允许移动裁剪框
          dragMode: "crop", // 默认为裁剪模式
          guides: true, // 显示裁剪参考线
          center: true, // 显示中心指示器
          highlight: true, // 突出显示裁剪框
          zoomable: true, // 允许缩放图片
        });
      }
    });
  }
};

// 生成指定尺寸的图标
const generateIcon = async (width: number, height: number): Promise<Blob> => {
  if (!cropper) throw new Error("No cropper instance");

  const canvas = cropper.getCroppedCanvas({
    width,
    height,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
};

// 生成 favicon.ico
const generateFavicon = async (sizes: number[]): Promise<Blob> => {
  const canvas = cropper!.getCroppedCanvas({
    width: sizes[0],
    height: sizes[1],
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  });

  // 获取PNG数据
  const pngBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
  const pngData = new Uint8Array(await pngBlob.arrayBuffer());
  const pngSize = pngData.length;

  // ICO 文件头 (6 字节)
  const header = new Uint8Array([
    0,
    0, // 保留
    1,
    0, // ICO类型
    1,
    0, // 图像数量
  ]);

  // 图像目录 (16 字节)
  const directory = new Uint8Array([
    sizes[0], // 宽度
    sizes[1], // 高度
    0, // 调色板颜色数
    0, // 保留
    1,
    0, // 颜色平面
    32,
    0, // 位深度
    pngSize & 0xff,
    (pngSize >> 8) & 0xff,
    (pngSize >> 16) & 0xff,
    (pngSize >> 24) & 0xff, // 图像大小
    22,
    0,
    0,
    0, // 数据偏移量 (6 + 16 = 22)
  ]);

  // 组合所有数据
  const icoData = new Uint8Array(22 + pngSize);
  icoData.set(header, 0); // 写入头部
  icoData.set(directory, 6); // 写入目录
  icoData.set(pngData, 22); // 写入PNG数据

  return new Blob([icoData], { type: "image/x-icon" });
};

const generate = async () => {
  if (!cropper || !currentFile.value) return;

  generating.value = true;
  try {
    const selectedTargets = targets.value.filter((t) => t.selected);

    // 如果只选择了一个目标
    if (selectedTargets.length === 1) {
      const target = selectedTargets[0];
      if (target.format === "ico") {
        const blob = await generateFavicon(target.sizes);
        downloadFile(blob, "favicon.ico");
      } else {
        const [w, h] = target.sizes;
        const blob = await generateIcon(w, h);
        downloadFile(blob, `${w}x${h}.png`);
      }
    } else {
      // 创建 zip 包
      const zip = new JSZip();

      // 处理每个选中的目标
      for (const target of selectedTargets) {
        if (target.format === "ico") {
          const favicon = await generateFavicon(target.sizes);
          const [w, h] = target.sizes;
          zip.file(`favicon_${w}x${h}.ico`, favicon);
        } else {
          const [w, h] = target.sizes;
          const blob = await generateIcon(w, h);
          zip.file(`${w}x${h}.png`, blob);
        }
      }

      // 生成并下载 zip 文件
      const content = await zip.generateAsync({ type: "blob" });
      downloadFile(content, "icons.zip");
    }
  } finally {
    generating.value = false;
  }
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onUnmounted(() => {
  if (cropper) {
    cropper.destroy();
  }
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<i18n lang="yaml">
en:
  toolName: "Favicon Generator"
  selectTargets: "Select Output Targets"
  generate: "Generate"
zh:
  toolName: "Favicon生成器"
  selectTargets: "选择输出目标"
  generate: "生成"
</i18n>
