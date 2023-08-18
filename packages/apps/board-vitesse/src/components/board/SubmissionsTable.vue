<script setup lang="ts">
import { onMounted } from "vue";
import { initFlowbite } from "flowbite";

import type { Rank } from "@xcpcio/core";

import { Pagination } from "~/composables/pagination";

const props = defineProps<{
  rank: Rank,
}>();

onMounted(() => {
  initFlowbite();
});

const rank = reactive(props.rank);

const p = ref(new Pagination());

p.value.currentPage = 0;
p.value.totalSize = rank.submissions.length;

const submissions = ref(rank.submissions.reverse());

function getSubmitTime(
  timeDiff: number,
): string {
  const h = Math.floor(timeDiff / 3600);
  const m = Math.floor(timeDiff % 3600 / 60);
  const s = timeDiff % 60;

  const f = (x: number) => x.toString().padStart(2, "0");

  return `${f(h)}:${f(m)}:${f(s)}`;
}

const notShowing = ref(false);
</script>

<template>
  <section>
    <div class="px-4 mx-auto lg:px-12 max-w-screen-2xl lg:min-w-screen-2xl">
      <div class="overflow-hidden bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg">
        <div class="px-4 py-3 flex flex-col lg:space-y-0 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-x-4">
          <div class="flex flex-col space-y-3 flex-shrink-0 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <button v-if="notShowing" type="button" class="flex items-center px-4 justify-center text-sm font-medium text-white rounded-lg focus:ring-4 py-2 bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
              <svg class="mr-2 h-3.5 w-3.5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              Add new product
            </button>

            <button v-if="notShowing" type="button" class="flex items-center justify-center flex-shrink-0 py-2 text-sm font-medium bg-white rounded-lg focus:outline-none focus:ring-4 dark:bg-gray-800 text-gray-900 border dark:text-gray-400 dark:border-gray-600 px-3 border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-gray-200 dark:focus:ring-gray-700 dark:hover:text-white dark:hover:bg-gray-700">
              <svg class="mr-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" viewbox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Update stocks 1/250
            </button>

            <button type="button" class="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
              <div i-pajamas-export class="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="text-sm text-gray-500 dark:text-gray-400 w-full text-left">
            <thead class="dark:text-gray-400 text-gray-700 bg-gray-50 text-xs uppercase dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-4 py-3">
                  Problem
                </th>
                <th v-if="rank.contest.organization" scope="col" class="px-4 py-3">
                  Organization
                </th>
                <th scope="col" class="px-4 py-3">
                  Submitter
                </th>
                <th scope="col" class="px-4 py-3">
                  Status
                </th>
                <th v-if="notShowing" scope="col" class="px-4 py-3">
                  Time
                </th>
                <th v-if="notShowing" scope="col" class="px-4 py-3">
                  Memory
                </th>
                <th v-if="notShowing" scope="col" class="px-4 py-3">
                  Answer
                </th>
                <th scope="col" class="px-4 py-3">
                  Submit Time
                </th>
              </tr>
            </thead>

            <tbody>
              <template v-for="s in submissions.slice(p.currentLeft, p.currentRight)" :key="s.id">
                <tr class="dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 border-b">
                  <td class="px-4 py-2 font-mono">
                    <span class="text-xs font-medium rounded bg-primary-100 text-primary-800 px-2 py-0.5 dark:bg-primary-900 dark:text-primary-300">
                      {{ rank.contest.problemsMap.get(s.problemId)?.label }}
                    </span>
                  </td>

                  <td v-if="rank.contest.organization" class="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {{ rank.teamsMap.get(s.teamId)?.organization }}
                  </td>

                  <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ rank.teamsMap.get(s.teamId)?.name }}
                  </td>

                  <td scope="row" class="flex items-center px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {{ s.status }}
                  </td>

                  <td v-if="notShowing" class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div class="flex items-center">
                      <div class="w-4 h-4 mr-2 rounded-full inline-block bg-red-700" />
                      95
                    </div>
                  </td>

                  <td v-if="notShowing" class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    0.47
                  </td>

                  <td v-if="notShowing" class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div class="flex items-center">
                      <span class="text-gray-500 dark:text-gray-400 ml-1">5.0</span>
                    </div>
                  </td>

                  <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <div class="flex items-center">
                      {{ getSubmitTime(s.timestamp) }}
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <nav
          class="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 p-4 items-start justify-between"
          aria-label="Table navigation"
        >
          <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">
            Showing
            <span class="text-gray-900 dark:text-white font-semibold">{{ p.currentLeft }}-{{ p.currentRight - 1 }}</span>
            of
            <span class="font-semibold text-gray-900 dark:text-white">{{ p.totalSize }}</span>
          </span>

          <ul class="inline-flex items-stretch -space-x-px font-mono">
            <li>
              <a
                href="#"
                :class="class_pagination_ix_pre"
                @click="p.onPageChange({ diff: -1 })"
              >
                <span class="sr-only">Previous</span>
                <div i-ic-baseline-keyboard-arrow-left class="w-5 h-5" />
              </a>
            </li>

            <li v-if="p.currentPage !== 0">
              <a
                href="#"
                :class="class_pagination_ix"
                @click="p.onPageChange({ to: 0 })"
              >
                1
              </a>
            </li>

            <li v-for="pn in p.leftDecrPage.reverse()" :key="pn">
              <a
                href="#"
                :class="class_pagination_ix"
                @click="p.onPageChange({ to: pn })"
              >
                {{ pn + 1 }}
              </a>
            </li>

            <li>
              <a
                href="#"
                aria-current="page"
                :class="class_pagination_ix_current"
              >
                {{ p.currentPage + 1 }}
              </a>
            </li>

            <li v-for="pn in p.rightIncrPage" :key="pn">
              <a
                href="#"
                :class="class_pagination_ix"
                @click="p.onPageChange({ to: pn })"
              >
                {{ pn + 1 }}
              </a>
            </li>

            <li v-if="p.currentPage !== p.totalPage - 1">
              <a
                href="#"
                :class="class_pagination_ix"
                @click="p.onPageChange({ to: p.totalPage - 1 })"
              >
                {{ p.totalPage }}
              </a>
            </li>

            <li>
              <a
                href="#"
                :class="class_pagination_ix_nx"
                @click="p.onPageChange({ diff: 1 })"
              >
                <span class="sr-only">Next</span>
                <div i-ic-baseline-keyboard-arrow-right class="w-5 h-5" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </section>
</template>
