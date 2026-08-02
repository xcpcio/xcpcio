<script setup lang="ts">
import type { Image } from "@xcpcio/types";
import { getImageSource } from "@xcpcio/core";

const props = defineProps<{
  image?: Image;
  alt?: string;
}>();

const imageSource = computed(() => {
  if (!props.image || (!props.image.base64 && !props.image.url)) {
    return undefined;
  }

  return getImageSource(props.image, unref(DATA_HOST));
});
</script>

<template>
  <div
    v-if="imageSource"
    class="flex items-center justify-center"
  >
    <img
      :src="imageSource"
      :alt="props.alt ?? 'badge'"
      class="max-h-full max-w-full object-contain mx-auto"
    >
  </div>
</template>
