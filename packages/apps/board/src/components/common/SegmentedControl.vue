<script setup lang="ts">
export interface SegmentedControlOption {
  value: string;
  label: string;
}

defineProps<{
  options: SegmentedControlOption[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function selectOption(value: string) {
  emit("update:modelValue", value);
}
</script>

<template>
  <div
    class="segmented-control"
    inline-flex
    rounded-lg
    bg-gray-100
    dark:bg-gray-800
    p-1
    border
    border-gray-200
    dark:border-gray-700
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="segment-btn"
      :class="{ active: modelValue === option.value }"
      px-4
      py-2
      text-sm
      font-medium
      rounded-md
      transition-all
      duration-200
      cursor-pointer
      @click="selectOption(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segment-btn {
  color: #6b7280;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.segment-btn:hover:not(.active) {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.05);
}

.segment-btn.active {
  background-color: white;
  color: #1e40af;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .segment-btn {
  color: #9ca3af;
}

.dark .segment-btn:hover:not(.active) {
  color: #e5e7eb;
  background-color: rgba(255, 255, 255, 0.05);
}

.dark .segment-btn.active {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
}
</style>
