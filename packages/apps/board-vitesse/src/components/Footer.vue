<script setup lang="ts">
import { GITHUB_URL } from "@xcpcio/types";
</script>

<template>
  <footer
    mt-8 p-4 lg:p-10 md:p-8
    w-screen
    flex justify-center items-center
  >
    <div
      mx-auto max-w-screen-lg text-center
    >
      <RouterLink
        flex items-center justify-center
        text-2xl font-semibold text-gray-900 dark:text-white
        to="/"
      >
        <div
          i-ion-balloon-sharp
          mr-4 h-8
        />
        Get more balloons
      </RouterLink>

      <p
        my-6 text-gray-500 dark:text-gray-400
        w-full
        flex justify-center
      >
        Open-source project of ICPC/CCPC Standings.
      </p>

      <ul
        mb-6
        w-full
        flex flex-wrap items-center justify-center
        text-gray-900 dark:text-white
      >
        <li>
          <RouterLink
            to="/"
            mr-4 md:mr-6 hover:underline
          >
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
        text-sm text-gray-500 sm:text-center dark:text-gray-400
        w-full
        flex justify-center
      >© 2020-PRESENT <RouterLink
        to="/"
        class="hover:underline"
      >XCPCIO™</RouterLink>. All Rights Reserved.</span>
    </div>
  </footer>
</template>
