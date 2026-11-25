<script setup lang="ts">
import { useViewportMeta } from "@board/composables/viewport";

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  meta: [
    {
      name: "theme-color",
      content: () => isDark.value ? "#00aba9" : "#ffffff",
    },
  ],
});

useViewportMeta();
</script>

<template>
  <RouterView />
</template>
