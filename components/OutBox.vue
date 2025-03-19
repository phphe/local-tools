<template>
  <span class="out-box inline-block">
    <slot />
  </span>
</template>

<style lang="scss">
.out-box {
  position: relative;
  padding: 3px;
  margin: -3px; // 负margin来抵消padding，保持原来的间距
}
</style>
