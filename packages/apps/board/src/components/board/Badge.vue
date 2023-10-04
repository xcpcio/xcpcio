<script setup lang="ts">
import type { Image } from "@xcpcio/types";

const props = defineProps<{
  image: Image
  widthClass?: string
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
    v-if="image.base64"
    :src="['data:image/png;base64,', image.base64].join('')"
    alt="badge"
    :class="[widthClass]"
  >
</template>
