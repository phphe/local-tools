<template>
  <button class="icon-button">
    <OutBox class="rounded-md hover:bg-gray-2 dark:hover:bg-gray-600">
      <Icon v-bind="iconProps" />
    </OutBox>
  </button>
</template>

<script setup lang="ts">
interface Props {
  path: string;
  size?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 23,
});

const iconProps = computed(() => ({
  path: props.path,
  size: props.size,
}));
</script>

<style lang="scss">
.icon-button {
}
</style>
