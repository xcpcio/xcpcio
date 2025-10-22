<script setup lang="ts">
import type { Image } from "@xcpcio/types";
import { getImageSource } from "@xcpcio/core";

const props = defineProps<{
  image: Image;
  widthClass?: string;
}>();

const image = computed(() => {
  return props.image;
});

const widthClass = computed(() => {
  if (props.widthClass) {
    return props.widthClass;
  }

  return "h-8 w-8";
});
</script>

<template>
  <img
    v-if="image.base64 || image.url"
    :src="getImageSource(image)"
    alt="badge"
    :class="[widthClass]"
  >
</template>
