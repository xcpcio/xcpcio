<script setup lang="ts">
const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  position: {
    type: String,
    default: "top",
    validator: (value: string) => ["top", "right", "bottom", "left"].includes(value),
  },
  delay: {
    type: Number,
    default: 100,
  },
  textColor: {
    type: String,
    default: "#fff",
  },
  width: {
    type: String,
    default: "auto",
  },
  zIndex: {
    type: Number,
    default: 1000,
  },
});

const isVisible = ref(false);
let timeoutId: ReturnType<typeof setTimeout>;

const tooltipStyle = computed(() => ({
  color: props.textColor,
  width: props.width,
  zIndex: props.zIndex,
}));

function showTooltip() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    isVisible.value = true;
  }, props.delay);
}

function hideTooltip() {
  clearTimeout(timeoutId);
  isVisible.value = false;
}
</script>

<template>
  <div class="tooltip-container" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot />
    <div
      class="tooltip"
      :class="[position, { visible: isVisible }]"
      :style="tooltipStyle"
    >
      {{ content }}
      <slot name="tooltip-content" />
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./HeatMapTooltip.less";
</style>
