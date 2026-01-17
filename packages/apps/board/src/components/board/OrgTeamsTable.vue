<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import { Pagination } from "@board/composables/pagination";
import { MedalType } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  organizationId: string;
  pageSize?: number;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const teams = computed(() => {
  return props.rank.teams
    .filter(t => t.organizationId === props.organizationId)
    .sort((a, b) => a.rank - b.rank);
});

const p = ref(new Pagination());

p.value.currentPage = 0;
p.value.pageSize = props.pageSize ?? 8;
p.value.totalSize = teams.value.length;

watch(teams, () => {
  p.value.totalSize = teams.value.length;

  if (p.value.currentPage >= p.value.totalPage) {
    p.value.currentPage = p.value.totalPage - 1;
  }
});

const currentTeams = computed(() => {
  return teams.value.slice(p.value.currentLeft, p.value.currentRight);
});

const hasAnyAward = computed(() => {
  return teams.value.some(t => t.awards.length > 0);
});

function getMedalEmoji(team: Team) {
  if (team.awards.includes(MedalType.GOLD)) {
    return "i-twemoji-1st-place-medal";
  }

  if (team.awards.includes(MedalType.SILVER)) {
    return "i-twemoji-2nd-place-medal";
  }

  if (team.awards.includes(MedalType.BRONZE)) {
    return "i-twemoji-3rd-place-medal";
  }

  if (team.awards.includes(MedalType.HONORABLE)) {
    return "i-twemoji-sports-medal";
  }

  return null;
}
</script>

<template>
  <section>
    <div
      mx-auto w-full
    >
      <div
        relative overflow-hidden
        bg-white dark:bg-gray-800
      >
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
                  {{ t("standings.place") }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  {{ t("standings.team") }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  {{ t("standings.solved") }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  {{ t("standings.penalty") }}
                </th>
                <th
                  v-if="hasAnyAward"
                  scope="col"
                  class="px-4 py-3"
                >
                  {{ t("team_info.award") }}
                </th>
              </tr>
            </thead>

            <tbody>
              <template
                v-for="team in currentTeams"
                :key="team.id"
              >
                <tr
                  class="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    {{ team.rank }}
                  </td>

                  <td
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    {{ team.name.getOrDefault(lang) }}
                  </td>

                  <td
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    {{ team.solvedProblemNum }}
                  </td>

                  <td
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    {{ team.penaltyToMinute }}
                  </td>

                  <td
                    v-if="hasAnyAward"
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    <span
                      v-if="getMedalEmoji(team)"
                      :class="getMedalEmoji(team)"
                      text-xl
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-if="p.totalPage > 1"
          v-model:pagination="p"
        />
      </div>
    </div>
  </section>
</template>
