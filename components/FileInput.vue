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
    if (acceptList.value.length && !acceptList.value.includes(file.type)) {
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
zh:
  dragDrop: "拖拽文件到这里或点击选择"
  supportedFormats: "支持的格式"
</i18n>
