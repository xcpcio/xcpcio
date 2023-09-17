<script setup lang="ts">
import { useMagicKeys } from "@vueuse/core";

const props = defineProps<{
  isHidden: boolean,

  title?: string,
  width?: string,
}>();

const emit = defineEmits(["update:isHidden"]);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

function onClose() {
  isHidden.value = true;
}

const { Escape } = useMagicKeys();
watch(Escape, (v) => {
  if (v) {
    onClose();
  }
});
</script>

<template>
  <div
    class="md:inset-0"
    fixed z-9997
    h-screen w-screen
    overflow-x-hidden
    flex justify-center items-start
    md:mt-32 sm:mt-16
  >
    <!-- background -->
    <div
      fixed left-0 top-0 z-9998
      h-screen w-screen
      :style="{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }"
      @click="onClose"
    />

    <div
      class="relative p-4"
      :class="[props.width ?? 'w-[78vw]']"
      z-9999
    >
      <div
        class="relative bg-white dark:bg-gray-800 sm:p-4"
        rounded-sm shadow-sm
      >
        <div
          class="mb-4 border-b rounded-t pb-4 sm:mb-4 dark:border-gray-600"
          flex items-center justify-between
        >
          <slot name="header">
            <h3
              text-gray-900 dark:text-white
              text-xl
              font-sans font-semibold italic
            >
              {{ props.title }}
            </h3>
          </slot>

          <button
            type="button"
            class="hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            bg-transparent
            ml-auto p-1.5
            text-sm text-gray-400
            items-center inline-flex rounded-lg
            @click="onClose"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              sr-only
            >
              Close modal
            </span>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>
