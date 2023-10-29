<script setup lang="ts">
const { modelValue } = defineModels<{
  modelValue: string | null
}>();

const inputEl = $ref<HTMLInputElement>();
const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
};

function clear() {
  modelValue.value = null;
  inputEl?.focus();
}

function focus() {
  inputEl?.focus();
}

defineExpose({ focus });
</script>

<template>
  <div relative>
    <input
      ref="inputEl"
      v-model="modelValue"
      v-focus
      v-bind="$attrs"
      p="x-4 y-2"
      text="left"
      bg="transparent"
      autocomplete="off"
      w="full"
      border="~ rounded gray-300 dark:gray-500"
      outline="none active:none"
      aria-label="Search"
      placeholder="Search..."
    >
    <button
      v-if="modelValue?.length"
      absolute flex right-2 w-10 top-2 bottom-2 text-xl op30 hover:op90
      aria-label="Clear search"
      @click="clear()"
    >
      <span
        i-carbon-close
        ma
        block
        aria-hidden="true"
      />
    </button>
  </div>
</template>
