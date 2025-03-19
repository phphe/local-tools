<template>
  <div class="mt-4">
    <h1 class="text-2xl">{{ t("toolName") }}</h1>
    <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
      {{ t("notice") }}
    </div>
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
          <h3 class="text-sm mb-2">{{ t("original") }}</h3>
          <div class="relative">
            <img
              ref="imageRef"
              :src="imageUrl"
              class="max-w-[300px] max-h-[300px] object-contain cursor-crosshair border border-gray-300 dark:border-gray-600 border-dashed"
              @click="pickColor"
            />
            <div class="text-sm mt-1 text-gray-500">
              {{ t("clickToPickColor") }}
            </div>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-sm mb-2">{{ t("preview") }}</h3>
          <div class="bg-gray-200 dark:bg-gray-700 p-2 rounded">
            <canvas
              ref="previewCanvas"
              class="max-w-[300px] max-h-[300px]"
            ></canvas>
          </div>
        </div>
      </div>
      <!-- 颜色列表 -->
      <div class="mt-4 space-y-2">
        <div
          v-for="(color, index) in selectedColors"
          :key="index"
          class="flex items-center gap-2 flex-wrap"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 border rounded"
              :style="{ backgroundColor: color.value }"
            ></div>
            <span>{{ t("tolerance") }}:</span>
            <input
              type="range"
              v-model="color.tolerance"
              min="0"
              max="100"
              class="w-32"
              @input="updatePreview"
            />
            <input
              type="number"
              v-model="color.tolerance"
              class="w-20 px-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              min="0"
              max="100"
              @input="updatePreview"
            />
            <IconBtn
              :path="mdiClose"
              @click="removeColor(index)"
              :title="t('clickToRemove')"
            />
          </div>
        </div>
      </div>
      <div class="mt-4">
        <Btn size="sm" @click="save" :disabled="!selectedColors.length">
          {{ t("save") }}
        </Btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBtn from "~/components/IconBtn.vue";
import { mdiClose } from "@mdi/js";

interface ColorConfig {
  value: string;
  tolerance: number;
}

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
const previewCanvas = ref<HTMLCanvasElement>();
const selectedColors = ref<ColorConfig[]>([]);
const imageSize = ref<{ width: number; height: number } | null>(null);

const handleFileChange = (file: File) => {
  if (file) {
    currentFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    imageSize.value = null;
    selectedColors.value = [];

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
  const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

  selectedColors.value.push({
    value: color,
    tolerance: 30,
  });

  updatePreview();
};

const removeColor = (index: number) => {
  selectedColors.value.splice(index, 1);
  updatePreview();
};

const updatePreview = () => {
  if (!imageRef.value || !previewCanvas.value) return;

  const img = imageRef.value;
  const canvas = previewCanvas.value;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    for (const colorConfig of selectedColors.value) {
      const targetColor = colorConfig.value.match(/\d+/g)!.map(Number);
      const toleranceValue = colorConfig.tolerance;

      const colorDiff = Math.sqrt(
        Math.pow(r - targetColor[0], 2) +
          Math.pow(g - targetColor[1], 2) +
          Math.pow(b - targetColor[2], 2)
      );

      if (colorDiff <= toleranceValue * 2.55) {
        data[i + 3] = 0;
        break;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const save = async () => {
  if (!previewCanvas.value || !currentFile.value) return;

  const blob = await new Promise<Blob>((resolve) => {
    previewCanvas.value!.toBlob((blob) => resolve(blob!), "image/png");
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const name = currentFile.value.name.split(".");
  name.pop();
  a.href = url;
  a.download = `${name.join(".")}_nobg.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onBeforeUnmount(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<i18n lang="yaml">
en:
  toolName: "Remove Image Background Colors"
  description: "Remove multiple background colors from an image online for free. Suitable for images with a solid color background. No upload or registration required."
  notice: "Note: This tool works best with solid color backgrounds. Click on different colors to remove multiple background colors."
  original: "Original"
  preview: "Preview"
  tolerance: "Color Tolerance"
  save: "Save"
  clickToPickColor: "Click to pick background colors"
  clickToRemove: "Click to remove this color"
zh:
  toolName: "图片去除背景色"
  description: "在线免费去除图片多个背景色，适合单色背景的图片，无需上传和注册。"
  notice: "注意：此工具最适合处理单色背景的图片。点击不同的颜色可以去除多个背景色。"
  original: "原图"
  preview: "预览"
  tolerance: "颜色容差"
  save: "保存"
  clickToPickColor: "点击选择背景色"
  clickToRemove: "点击移除此颜色"
es:
  toolName: "Eliminar Colores de Fondo"
  description: "Elimine múltiples colores de fondo de imágenes en línea gratis. Ideal para imágenes con fondo de color sólido. Sin necesidad de subir archivos ni registrarse."
  notice: "Nota: Esta herramienta funciona mejor con fondos de color sólido. Haga clic en diferentes colores para eliminar múltiples colores de fondo."
  original: "Original"
  preview: "Vista Previa"
  tolerance: "Tolerancia de Color"
  save: "Guardar"
  clickToPickColor: "Haga clic para seleccionar colores de fondo"
  clickToRemove: "Haga clic para eliminar este color"
pt:
  toolName: "Remover Cores de Fundo"
  description: "Remova múltiplas cores de fundo de imagens online gratuitamente. Adequado para imagens com fundo de cor sólida. Sem necessidade de upload ou registro."
  notice: "Nota: Esta ferramenta funciona melhor com fundos de cor sólida. Clique em diferentes cores para remover múltiplas cores de fundo."
  original: "Original"
  preview: "Pré-visualização"
  tolerance: "Tolerância de Cor"
  save: "Salvar"
  clickToPickColor: "Clique para selecionar cores de fundo"
  clickToRemove: "Clique para remover esta cor"
id:
  toolName: "Hapus Warna Latar Belakang"
  description: "Hapus beberapa warna latar belakang dari gambar secara online gratis. Cocok untuk gambar dengan latar belakang warna solid. Tanpa perlu unggah dan registrasi."
  notice: "Catatan: Alat ini bekerja paling baik dengan latar belakang warna solid. Klik pada warna yang berbeda untuk menghapus beberapa warna latar belakang."
  original: "Asli"
  preview: "Pratinjau"
  tolerance: "Toleransi Warna"
  save: "Simpan"
  clickToPickColor: "Klik untuk memilih warna latar belakang"
  clickToRemove: "Klik untuk menghapus warna ini"
fr:
  toolName: "Supprimer les Couleurs d'Arrière-plan"
  description: "Supprimez gratuitement plusieurs couleurs d'arrière-plan d'une image en ligne. Idéal pour les images avec un arrière-plan de couleur unie. Pas besoin de téléchargement ni d'inscription."
  notice: "Note : Cet outil fonctionne mieux avec des arrière-plans de couleur unie. Cliquez sur différentes couleurs pour supprimer plusieurs couleurs d'arrière-plan."
  original: "Original"
  preview: "Aperçu"
  tolerance: "Tolérance de Couleur"
  save: "Enregistrer"
  clickToPickColor: "Cliquez pour sélectionner les couleurs d'arrière-plan"
  clickToRemove: "Cliquez pour supprimer cette couleur"
ja:
  toolName: "背景色の削除"
  description: "画像の複数の背景色をオンラインで無料で削除。単色の背景を持つ画像に最適。アップロードや登録は不要。"
  notice: "注意：このツールは単色の背景で最も効果的です。異なる色をクリックして複数の背景色を削除できます。"
  original: "原画像"
  preview: "プレビュー"
  tolerance: "色の許容値"
  save: "保存"
  clickToPickColor: "クリックして背景色を選択"
  clickToRemove: "クリックしてこの色を削除"
ru:
  toolName: "Удаление Цветов Фона"
  description: "Удалите несколько цветов фона из изображения онлайн бесплатно. Подходит для изображений с однотонным фоном. Без загрузки и регистрации."
  notice: "Примечание: Этот инструмент лучше всего работает с однотонными фонами. Нажмите на разные цвета, чтобы удалить несколько цветов фона."
  original: "Оригинал"
  preview: "Предпросмотр"
  tolerance: "Допуск Цвета"
  save: "Сохранить"
  clickToPickColor: "Нажмите, чтобы выбрать цвета фона"
  clickToRemove: "Нажмите, чтобы удалить этот цвет"
de:
  toolName: "Hintergrundfarben Entfernen"
  description: "Entfernen Sie kostenlos mehrere Hintergrundfarben aus Bildern online. Geeignet für Bilder mit einfarbigem Hintergrund. Kein Upload und keine Registrierung erforderlich."
  notice: "Hinweis: Dieses Tool funktioniert am besten mit einfarbigen Hintergründen. Klicken Sie auf verschiedene Farben, um mehrere Hintergrundfarben zu entfernen."
  original: "Original"
  preview: "Vorschau"
  tolerance: "Farbtoleranz"
  save: "Speichern"
  clickToPickColor: "Klicken Sie, um Hintergrundfarben auszuwählen"
  clickToRemove: "Klicken Sie, um diese Farbe zu entfernen"
</i18n>
