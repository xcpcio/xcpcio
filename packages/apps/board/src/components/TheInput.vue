<script setup lang="ts">
const props = defineProps<{
  textAlign?: "left" | "center" | "right"
  textType?: "text" | "number"
}>();

const { modelValue } = defineModels<{
  modelValue: string | number
}>();
</script>

<template>
  <input
    id="input"
    v-model="modelValue"
    v-bind="$attrs"
    :type="props.textType ?? 'text'"
    :text="props.textAlign ?? 'center'"
    p="x-4 y-2"
    w-full
    bg="transparent"
    border="~ rounded gray-200 dark:gray-700"
    outline="none active:none"
  >
</template>
