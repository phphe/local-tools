<template>
  <div class="relative inline-block" :class="{ 'popover--open': visible }">
    <div ref="triggerRef" @click="toggle" class="popover-trigger">
      <slot></slot>
    </div>
    <Teleport to="body">
      <div
        v-show="visible"
        ref="contentRef"
        class="fixed z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg"
        :style="contentStyle"
        @click="handleContentClick"
      >
        <slot name="content"></slot>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  offset?: number; // 与触发元素的距离
  menu?: boolean; // 菜单模式，点击内容后是否自动关闭
}>();

const visible = ref(false);
const triggerRef = ref<HTMLElement>();
const contentRef = ref<HTMLElement>();
const contentStyle = ref({
  top: "0px",
  left: "0px",
});

// 切换显示状态
const toggle = () => {
  visible.value = !visible.value;
  if (visible.value) {
    nextTick(updatePosition);
  }
};

// 更新位置
const updatePosition = () => {
  if (!triggerRef.value || !contentRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const contentRect = contentRef.value.getBoundingClientRect();
  const offset = props.offset || 4;

  // 默认显示在下方
  let top = triggerRect.bottom + offset;
  let left = triggerRect.left;

  // 检查是否超出底部
  if (top + contentRect.height > window.innerHeight) {
    // 显示在上方
    top = triggerRect.top - contentRect.height - offset;
  }

  // 检查是否超出右侧
  if (left + contentRect.width > window.innerWidth) {
    left = window.innerWidth - contentRect.width - offset;
  }

  // 检查是否超出左侧
  if (left < 0) {
    left = offset;
  }

  contentStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  };
};

// 点击外部关闭
const clickOutside = (e: MouseEvent) => {
  if (
    visible.value &&
    !triggerRef.value?.contains(e.target as Node) &&
    !contentRef.value?.contains(e.target as Node)
  ) {
    visible.value = false;
  }
};
// 处理内容点击
const handleContentClick = () => {
  if (props.menu) {
    visible.value = false;
  }
};

// 监听窗口大小变化
const onResize = () => {
  if (visible.value) {
    updatePosition();
  }
};

onMounted(() => {
  document.addEventListener("click", clickOutside);
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onResize);
});

onUnmounted(() => {
  document.removeEventListener("click", clickOutside);
  window.removeEventListener("resize", onResize);
  window.removeEventListener("scroll", onResize);
});
</script>

<style lang="scss">
.popover-trigger .caret {
  transition: 0.3s;
}
.popover--open .popover-trigger .caret {
  transform: rotate(180deg);
}
</style>
