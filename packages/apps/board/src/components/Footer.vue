<script setup lang="ts">
import { GITHUB_SHA, GITHUB_URL, VERSION } from "@xcpcio/types";
</script>

<template>
  <footer
    mt-8
    py-4 md:py-8 lg:py-10
    w-full
    flex justify-center items-center
  >
    <div
      text-center
      w-full
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
          <div
            mr-4 md:mr-6
          >
            <Tooltip>
              <a
                :href="GITHUB_URL"
                hover:underline
                rel="noreferrer"
                target="_blank"
                title="GitHub"
              >
                GitHub
              </a>

              <template #popper>
                <div
                  flex justify-center items-start
                  flex-col
                >
                  <div>Tag: {{ VERSION }}</div>
                  <div>Sha: {{ GITHUB_SHA }}</div>
                </div>
              </template>
            </Tooltip>
          </div>
        </li>

        <li>
          <div
            mr-4 md:mr-6
          >
            <Tooltip>
              <a
                href="mailto:hi@dup4.com"
                hover:underline
              >
                Contact
              </a>

              <template #popper>
                <div
                  flex justify-center items-start
                  flex-col
                >
                  <div>CDN Host: {{ CDN_HOST }}</div>
                  <div>DATA Host: {{ DATA_HOST }}</div>
                  <div>Data Region: {{ DATA_REGION }}</div>
                </div>
              </template>
            </Tooltip>
          </div>
        </li>
      </ul>

      <span
        text-sm text-gray-500 sm:text-center dark:text-gray-400
        w-full
      >© 2020-PRESENT <RouterLink
        to="/"
        hover:underline
      >XCPCIO™</RouterLink>. All Rights Reserved.</span>
    </div>
  </footer>
</template>
