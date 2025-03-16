<template>
  <button class="btn" :class="`btn--${color} btn--${size}`">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "warning" | "danger";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  color: "default",
});
</script>

<style lang="scss">
// size
.btn--sm {
  --at-apply: text-sm py-1 px-2;
}
.btn--md{
  --at-apply: text-base py-2 px-4;
}
.btn--lg {
  --at-apply: text-lg py-3 px-5;
}
// color
.btn--primary {
  --at-apply: bg-teal-5 rounded text-white transition-colors hover:bg-teal-6 active:bg-teal-7 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn--default {
  --at-apply: bg-white rounded text-gray-700 border border-gray-300 transition-colors hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600;
}

.btn--warning {
  --at-apply: bg-amber-5 rounded text-white transition-colors hover:bg-amber-6 active:bg-amber-7 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn--danger {
  --at-apply: bg-red-5 rounded text-white transition-colors hover:bg-red-6 active:bg-red-7 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
