<script setup lang="ts">
import { useIsContestIndexPage } from "@board/composables/indexPage";

const isContestIndexPage = useIsContestIndexPage();
</script>

<template>
  <NavBar
    width="w-full"
  />
  <main
    :class="{ 'lg:mt-[-52px]': isContestIndexPage }"
    py-2
    text-gray-700 dark:text-gray-200
  >
    <RouterView />
    <Footer />
  </main>
</template>
