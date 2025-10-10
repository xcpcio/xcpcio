<script setup lang="ts">
import type { SelectOptionItem } from "@xcpcio/core";
import { MultiSelect } from "vue-search-select";

interface Props {
  options: SelectOptionItem[];
  selectedOptions: SelectOptionItem[];
}

interface Emits {
  (e: "select", selectedItems: SelectOptionItem[], lastSelectItem: SelectOptionItem): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const isComposing = ref(false);

function onCompositionStart() {
  isComposing.value = true;
}

function onCompositionEnd() {
  isComposing.value = false;
}

function onDelete(event: Event) {
  if (isComposing.value) {
    event.stopPropagation();
  }
}

function onSelect(selectedItems: SelectOptionItem[], lastSelectItem: SelectOptionItem) {
  emit("select", selectedItems, lastSelectItem);
}
</script>

<template>
  <MultiSelect
    :class="{ 'is-composing': isComposing }"
    :options="options"
    :selected-options="selectedOptions"
    @select="onSelect"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @keydown.delete.capture="onDelete"
  />
</template>
