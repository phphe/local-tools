<template>
  <span class="out-box inline-block">
    <slot />
  </span>
</template>

<style lang="scss">
.out-box {
  position: relative;
  padding: 0.5rem;
  margin: -0.5rem; // 负margin来抵消padding，保持原来的间距
}
</style>
