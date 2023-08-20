<script setup lang="ts">
const props = defineProps<{
  width: number,
}>();
</script>

<template>
  <div
    class="am-progress am-progress-striped am-active w-full"
  >
    <div
      class="am-progress-bar am-progress-bar-primary"
      :style="{ width: `${props.width}%` }"
    />
  </div>
</template>

<style scoped lang="less">
@import "./Progress.less";
</style>
