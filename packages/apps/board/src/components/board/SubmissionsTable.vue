<script setup lang="ts">
import type { Rank, SelectOptionItem, Submissions } from "@xcpcio/core";

import type { SubmissionReaction, SubmissionStatus } from "@xcpcio/types";
import { Submission } from "@xcpcio/core";
import { SubmissionStatusToString } from "@xcpcio/types";
import { MultiSelect } from "vue-search-select";

import { Pagination } from "~/composables/pagination";

import "~/styles/submission-status-filter.css";

interface FilterOptions {
  orgNames: string[];
  teamIds: string[];
  languages: string[];
  statuses: SubmissionStatus[];
}

interface EnableFilterOptions {
  organization?: boolean;
  team?: boolean;
  language?: boolean;
  status?: boolean;
}

const props = defineProps<{
  rank: Rank;
  submissions: Submissions;
  pageSize?: number;
  removeBorder?: boolean;
  enableFilter?: EnableFilterOptions;
}>();

const rank = computed(() => props.rank);
const enableFilter = computed(() => props.enableFilter);
const enableFilterButton = computed(() => {
  if (!enableFilter.value) {
    return false;
  }

  for (const [_k, v] of Object.entries(enableFilter.value)) {
    if (v === true) {
      return true;
    }
  }

  return false;
});

const filterOptions = ref<FilterOptions>({
  orgNames: [],
  teamIds: [],
  languages: [],
  statuses: [],
});

const orgOptions = computed(() => {
  const res = rank.value.organizations.map((o) => {
    return {
      value: o,
      text: o,
    };
  });

  return res;
});

const orgSelectedItems = ref<Array<SelectOptionItem>>([]);
const orgLastSelectItem = ref({});

function orgOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  orgSelectedItems.value = selectedItems;
  orgLastSelectItem.value = lastSelectItem;
}

const teamsOptions = computed(() => {
  const res = rank.value.originTeams.map((t) => {
    return {
      value: t.id,
      text: t.organization ? `${t.name} - ${t.organization}` : t.name,
    };
  });

  return res;
});

const teamsSelectedItems = ref<Array<SelectOptionItem>>([]);
const teamsLastSelectItem = ref({});

function teamsOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  teamsSelectedItems.value = selectedItems;
  teamsLastSelectItem.value = lastSelectItem;
}

const languageOptions = computed(() => {
  const languages = rank.value.languages;

  const res = languages.map((l) => {
    return {
      value: l,
      text: l,
    };
  });

  return res;
});

const languageSelectedItems = ref<Array<SelectOptionItem>>([]);
const languageLastSelectItem = ref({});

function languageOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  languageSelectedItems.value = selectedItems;
  languageLastSelectItem.value = lastSelectItem;
}

const statusOptions = computed(() => {
  const statuses = rank.value.statuses;

  const res = statuses.map((s) => {
    return {
      value: s,
      text: SubmissionStatusToString[s],
    };
  });

  return res;
});

const statusSelectedItems = ref<Array<SelectOptionItem>>([]);
const statusLastSelectItem = ref({});

function statusOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  statusSelectedItems.value = selectedItems;
  statusLastSelectItem.value = lastSelectItem;
}

function statusCustomAttr(option: SelectOptionItem) {
  return option.value.toString();
}

const submissions = computed(() => {
  const ss = props.submissions;
  return ss.filter((s) => {
    const o = filterOptions.value;

    if (o.orgNames.length === 0
      && o.teamIds.length === 0
      && o.languages.length === 0
      && o.statuses.length === 0
    ) {
      return true;
    }

    if (o.teamIds.length > 0) {
      for (const t of o.teamIds) {
        if (t === s.teamId) {
          return true;
        }
      }
    }

    if (o.orgNames.length > 0) {
      const team = rank.value.teamsMap.get(s.teamId);
      for (const n of o.orgNames) {
        if (n === team?.organization) {
          return true;
        }
      }
    }

    if (o.languages.length > 0) {
      for (const l of o.languages) {
        if (l === s.language) {
          return true;
        }
      }
    }

    if (o.statuses.length > 0) {
      for (const sta of o.statuses) {
        if (sta === s.status) {
          return true;
        }
      }
    }

    return false;
  }).sort(Submission.compare).reverse();
});

function onFilter() {
  const newFilterOptions: FilterOptions = {
    orgNames: [],
    teamIds: [],
    languages: [],
    statuses: [],
  };

  newFilterOptions.orgNames = orgSelectedItems.value.map(o => o.value);
  newFilterOptions.teamIds = teamsSelectedItems.value.map(t => t.value);
  newFilterOptions.languages = languageSelectedItems.value.map(l => l.value);
  newFilterOptions.statuses = statusSelectedItems.value.map(s => s.value as SubmissionStatus);

  filterOptions.value = newFilterOptions;
}

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

  return {
    backgroundColor: p.balloonColor.background_color,
    color: p.balloonColor.color,
  };
}

const showVideoModal = ref(false);
const currentSubmissionReaction = ref(null as unknown as SubmissionReaction);

function openVideoModal(submissionReaction: SubmissionReaction) {
  currentSubmissionReaction.value = submissionReaction;
  showVideoModal.value = true;
}

function closeVideoModal() {
  showVideoModal.value = false;
}
</script>

<template>
  <section>
    <div
      mx-auto w-full
    >
      <div
        v-if="showVideoModal"
        flex justify-start items-start
      >
        <ReactionVideoModal
          :is-open="showVideoModal"
          :submission-reaction="currentSubmissionReaction"
          @close="closeVideoModal"
        />
      </div>

      <div
        relative overflow-hidden
        bg-white dark:bg-gray-800
        :class="{
          'shadow-md': props.removeBorder !== true,
          'sm:rounded-sm': props.removeBorder !== true,
        }"
      >
        <div
          space-y-3
          flex flex-col
          px-4 py-3
          lg:flex-row lg:items-center lg:justify-between
          lg:space-x-4 lg:space-y-0
        >
          <div
            flex flex-shrink-0 flex-col
            md:flex-row md:items-center
            lg:justify-end space-y-3
            md:space-x-3 md:space-y-0
          >
            <div
              v-if="rank.contest.organization && enableFilter?.organization"
              w-48
            >
              <MultiSelect
                :options="orgOptions"
                :selected-options="orgSelectedItems"
                :placeholder="rank.contest.organization"
                @select="orgOnSelect"
              />
            </div>

            <div
              v-if="enableFilter?.team"
              w-48
            >
              <MultiSelect
                :options="teamsOptions"
                :selected-options="teamsSelectedItems"
                placeholder="Team"
                @select="teamsOnSelect"
              />
            </div>

            <div
              v-if="enableFilter?.status"
              w-68
            >
              <MultiSelect
                :options="statusOptions"
                :selected-options="statusSelectedItems"
                placeholder="Status"
                :custom-attr="statusCustomAttr"
                @select="statusOnSelect"
              />
            </div>

            <div
              v-if="enableFilter?.language && languageOptions.length > 0"
              w-48
            >
              <MultiSelect
                :options="languageOptions"
                :selected-options="languageSelectedItems"
                placeholder="Language"
                @select="languageOnSelect"
              />
            </div>

            <div
              v-if="enableFilterButton"
            >
              <button
                type="button"
                class="flex flex-shrink-0 items-center justify-center border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:z-10 dark:border-gray-600 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                @click="onFilter"
              >
                <div
                  i-material-symbols-search
                  mr-1 h-5 w-5
                />
                Filter
              </button>
            </div>
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
                <th
                  v-if="rank.contest.options.submissionEnableActionField"
                  scope="col"
                  class="px-4 py-3"
                >
                  Action
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
                      {{ `${s.time ?? 0} ms` }}
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

                  <td
                    v-if="rank.contest.options.submissionEnableActionField"
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <Tooltip>
                      <div
                        v-if="s.reaction"
                        flex items-center justify-start
                        text-lg
                        cursor-pointer
                        i-material-symbols-slow-motion-video
                        @click="openVideoModal(s.reaction)"
                      />
                      <template #popper>
                        Reaction Video
                      </template>
                    </Tooltip>
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
