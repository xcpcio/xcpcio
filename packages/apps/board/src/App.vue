<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: "Board - XCPCIO",
  meta: [
    {
      name: "description",
      content: "XCPCIO-Board 主要收录 *CPC 系列竞赛的榜单。",
    },
    {
      name: "keywords",
      content: "icpc, ccpc, rank, board, standings",
    },
    {
      name: "theme-color",
      content: () => isDark.value ? "#00aba9" : "#ffffff",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: () => preferredDark.value ? "/favicon-dark.svg" : "/favicon.svg",
    },
  ],
});
</script>

<template>
  <RouterView />
</template>
