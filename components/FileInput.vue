<template>
  <div
    class="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-colors"
    @dragover.prevent
    @drop.prevent="handleDrop"
    @click="$refs.fileInput.click()"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      @change="handleChange"
      :multiple="!!multiple"
    />
    <div class="space-y-2">
      <div class="text-gray-600 dark:text-gray-400">
        <slot>{{ t("dragDrop") }}</slot>
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-500">
        {{ t("supportedFormats") }}: {{ acceptList.join(", ") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /*
   * A comma-separated list of file types that the input should accept.
   * For example, "image/*" will accept all image files.
   */
  accept?: string;
  multiple?: boolean;
}>();

const emit = defineEmits<{
  (e: "change", file: File, files: FileList, event: Event): void;
}>();

const { t } = useI18n({
  useScope: "local",
});

const fileInput = ref<HTMLInputElement>();
const acceptList = computed(
  () => props.accept?.split(",").map((x) => x.trim()) || []
);
const canAccept = (mimeType: string) => {
  const exactMatch: string[] = [];
  const wildcardMatch: string[] = [];
  if (acceptList.value.length === 0) {
    return true;
  }
  for (const item of acceptList.value) {
    if (item.endsWith("/*")) {
      wildcardMatch.push(item.slice(0, -1));
    } else {
      exactMatch.push(item);
    }
  }
  return (
    exactMatch.includes(mimeType) ||
    wildcardMatch.some((x) => mimeType.startsWith(x))
  );
};

const handleChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  const file = files?.[0];
  if (file) {
    emit("change", file, files, e);
  }
};

const handleDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  const file = files?.[0];
  if (file) {
    if (!canAccept(file.type)) {
      alert(t("unsupportedFormat"));
      return;
    }
    emit("change", file, files, e);
  }
};
</script>

<i18n lang="yaml">
en:
  dragDrop: "Drag and drop files here or click to select"
  supportedFormats: "Supported formats"
  unsupportedFormat: "Unsupported format"
zh:
  dragDrop: "拖拽文件到这里或点击选择"
  supportedFormats: "支持的格式"
  unsupportedFormat: "不支持的格式"
es:
  dragDrop: "Arrastra y suelta archivos aquí o haz clic para seleccionar"
  supportedFormats: "Formatos soportados"
  unsupportedFormat: "Formato no soportado"
pt:
  dragDrop: "Arraste e solte arquivos aqui ou clique para selecionar"
  supportedFormats: "Formatos suportados"
  unsupportedFormat: "Formato não suportado"
id:
  dragDrop: "Seret dan lepaskan file di sini atau klik untuk memilih"
  supportedFormats: "Format yang didukung"
  unsupportedFormat: "Format tidak didukung"
fr:
  dragDrop: "Glissez et déposez les fichiers ici ou cliquez pour sélectionner"
  supportedFormats: "Formats pris en charge"
  unsupportedFormat: "Format non pris en charge"
ja:
  dragDrop: "ファイルをドラッグ＆ドロップまたはクリックして選択"
  supportedFormats: "対応フォーマット"
  unsupportedFormat: "非対応フォーマット"
ru:
  dragDrop: "Перетащите файлы сюда или нажмите для выбора"
  supportedFormats: "Поддерживаемые форматы"
  unsupportedFormat: "Неподдерживаемый формат"
de:
  dragDrop: "Dateien hierher ziehen oder klicken zum Auswählen"
  supportedFormats: "Unterstützte Formate"
  unsupportedFormat: "Nicht unterstützter Format"
</i18n>
