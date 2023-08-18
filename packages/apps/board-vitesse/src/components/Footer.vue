<script setup lang="ts">
import { GITHUB_URL } from "@xcpcio/types";
</script>

<template>
  <footer class="p-4 md:p-8 lg:p-10 mt-8">
    <div class="mx-auto text-center max-w-screen-lg">
      <RouterLink
        class="flex text-2xl justify-center items-center font-semibold text-gray-900 dark:text-white"
        to="/"
      >
        <div i-ion-balloon-sharp class="mr-4 h-8" />
        XCPCIO Board
      </RouterLink>

      <p class="my-6 text-gray-500 dark:text-gray-400">
        Open-source project of ICPC/CCPC Standings.
      </p>

      <ul class="flex justify-center items-center text-gray-900 dark:text-white flex-wrap mb-6">
        <li>
          <RouterLink to="/" class="mr-4 hover:underline md:mr-6">
            Home
          </RouterLink>
        </li>

        <li>
          <a
            :href="GITHUB_URL"
            class="mr-4 hover:underline md:mr-6"
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
            class="mr-4 hover:underline md:mr-6"
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
