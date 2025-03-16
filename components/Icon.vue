<template>
  <span class="icon icon-mdi" :style="{ width: computedSize }">
    <span data-nosnippet v-html="'\u200b'"></span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path :d="path"></path>
    </svg>
  </span>
</template>

<script lang="ts">
export const config = reactive({
  defaultSize: "1em",
});

export default {
  props: {
    path: {
      type: String,
      required: true
    },
    size: { type: [String, Number] },
  },
  setup(props) {
    const computedSize = computed(() => {
      let size = props.size || config.defaultSize
      return typeof size === "number" ? size + "px" : size
    }
    );
    return { computedSize };
  },
}
</script>

<style>
.icon-mdi {
  display: inline-flex;
  width: 1em;
}

.icon [data-nosnippet] {
  user-select: none;
}

svg {
  width: 100%;
  height: auto;
  fill: currentColor;
}
</style>