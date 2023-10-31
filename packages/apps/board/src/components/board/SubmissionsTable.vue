<script setup lang="ts">
import type { Rank, Submissions } from "@xcpcio/core";
import { Submission } from "@xcpcio/core";
import { SubmissionStatusToString } from "@xcpcio/types";

import { Pagination } from "~/composables/pagination";

const props = defineProps<{
  rank: Rank,
  submissions: Submissions,
  pageSize?: number,
  removeBorder?: boolean,
}>();

const rank = computed(() => props.rank);
const submissions = computed(() => {
  const s = props.submissions;
  return s.sort(Submission.compare).reverse();
});

const p = ref(new Pagination());

p.value.currentPage = 0;
p.value.pageSize = props.pageSize ?? 16;
p.value.totalSize = submissions.value.length;

watch(submissions, () => {
  p.value.totalSize = submissions.value.length;

  if (p.value.currentPage >= p.value.totalPage) {
    p.value.currentPage = p.value.totalPage - 1;
  }
});

const currentSubmissions = computed(() => {
  return submissions.value.slice(p.value.currentLeft, p.value.currentRight);
});

const notShowing = ref(false);

function getProblemLabelColorClass(s: Submission) {
  const defaultClass = "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300";

  const pId = s.problemId;
  const p = rank.value.contest.problemsMap.get(pId);

  if (p === null || p === undefined || !p.balloonColor) {
    return defaultClass;
  }
}

function getProblemLabelColorStyle(s: Submission) {
  const pId = s.problemId;
  const p = rank.value.contest.problemsMap.get(pId);

  if (p === null || p === undefined || !p.balloonColor) {
    return undefined;
  }

  const b = p.balloonColor;

  return {
    backgroundColor: b.background_color as string,
    color: b.color as string,
  };
}
</script>

<template>
  <section>
    <div
      class="mx-auto w-full"
      px-4
    >
      <div
        class="relative overflow-hidden bg-white dark:bg-gray-800"
        :class="{
          'shadow-md': props.removeBorder !== true,
          'sm:rounded-sm': props.removeBorder !== true,
        }"
      >
        <div
          class="lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-x-4 lg:space-y-0"
          flex flex-col
          px-4 py-3
        >
          <div
            class="flex flex-shrink-0 flex-col md:flex-row md:items-center lg:justify-end space-y-3 md:space-x-3 md:space-y-0"
          >
            <button
              v-if="notShowing"
              type="button"
              class="flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white dark:bg-primary-600 hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              <svg
                class="mr-2 h-3.5 w-3.5"
                fill="currentColor"
                viewbox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                />
              </svg>
              Add new product
            </button>

            <button
              v-if="notShowing"
              type="button"
              class="flex flex-shrink-0 items-center justify-center border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:z-10 dark:border-gray-600 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              <svg
                class="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                fill="none"
                viewbox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Update stocks 1/250
            </button>

            <button
              v-if="notShowing"
              type="button"
              class="flex flex-shrink-0 items-center justify-center border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:z-10 dark:border-gray-600 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              <div
                i-pajamas-export
                class="mr-2 h-4 w-4"
              />
              Export
            </button>
          </div>
        </div>

        <div
          class="overflow-x-auto"
        >
          <table
            class="w-full text-left text-sm text-gray-500 dark:text-gray-400"
            font-medium font-mono
          >
            <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  Problem
                </th>
                <th
                  v-if="rank.contest.organization"
                  scope="col"
                  class="px-4 py-3"
                >
                  {{ rank.contest.organization }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  Team
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  Status
                </th>
                <th
                  v-if="rank.contest.options.submissionHasTimeField"
                  scope="col"
                  class="px-4 py-3"
                >
                  Time
                </th>
                <th
                  v-if="notShowing"
                  scope="col"
                  class="px-4 py-3"
                >
                  Memory
                </th>
                <th
                  v-if="rank.contest.options.submissionHasLanguageField"
                  scope="col"
                  class="px-4 py-3"
                >
                  Answer
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  Submit Time
                </th>
              </tr>
            </thead>

            <tbody>
              <template
                v-for="s in currentSubmissions"
                :key="s.id"
              >
                <tr
                  class="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td
                    px-4 py-2
                  >
                    <span
                      class="rounded px-2 py-0.5 text-sm"
                      :class="[getProblemLabelColorClass(s)]"
                      :style="getProblemLabelColorStyle(s)"
                    >
                      {{ rank.contest.problemsMap.get(s.problemId)?.label }}
                    </span>
                  </td>

                  <td
                    v-if="rank.contest.organization"
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    {{ rank.teamsMap.get(s.teamId)?.organization }}
                  </td>

                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    {{ rank.teamsMap.get(s.teamId)?.name }}
                  </td>

                  <td
                    scope="row"
                    :class="[s.status.toString()]"
                    whitespace-nowrap px-4 py-2
                    flex items-center
                    font-bold
                  >
                    {{ SubmissionStatusToString[s.status] }}
                  </td>

                  <td
                    v-if="rank.contest.options.submissionHasTimeField"
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <div flex items-center>
                      {{ `${s.time} ms` }}
                    </div>
                  </td>

                  <td
                    v-if="notShowing"
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    0.47
                  </td>

                  <td
                    v-if="rank.contest.options.submissionHasLanguageField"
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <div flex items-center>
                      {{ s.language }}
                    </div>
                  </td>

                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    <div flex items-center>
                      <Tooltip>
                        {{ s.timestampDisplayFormatWithSecond }}
                        <template #popper>
                          {{ s.timestampDisplayFormatWithMilliSecond }}
                        </template>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:pagination="p"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="less">
@import "../../styles/submission-status.css";
</style>
