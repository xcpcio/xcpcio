<script setup lang="ts">
import { GITHUB_URL } from "@xcpcio/types";
</script>

<template>
  <footer class="mt-8 p-4 lg:p-10 md:p-8">
    <div class="mx-auto max-w-screen-lg text-center">
      <RouterLink
        class="flex items-center justify-center text-2xl font-semibold text-gray-900 dark:text-white"
        to="/"
      >
        <div i-ion-balloon-sharp class="mr-4 h-8" />
        XCPCIO Board
      </RouterLink>

      <p class="my-6 text-gray-500 dark:text-gray-400">
        Open-source project of ICPC/CCPC Standings.
      </p>

      <ul class="flex items-center justify-center text-gray-900 dark:text-white mb-6 flex-wrap">
        <li>
          <RouterLink to="/" class="mr-4 md:mr-6 hover:underline">
            Home
          </RouterLink>
        </li>

        <li>
          <a
            :href="GITHUB_URL"
            class="mr-4 md:mr-6 hover:underline"
            rel="noreferrer"
            target="_blank"
            title="GitHub"
          >
            GitHub
          </a>
        </li>

        <li>
          <a
            href="mailto:hi@dup4.com"
            class="mr-4 md:mr-6 hover:underline"
          >Contact</a>
        </li>
      </ul>

      <span
        class="text-gray-500 dark:text-gray-400 text-sm sm:text-center"
      >© 2020-PRESENT <RouterLink
        to="/"
        class="hover:underline"
      >XCPCIO™</RouterLink>. All Rights Reserved.</span>
    </div>
  </footer>
</template>
