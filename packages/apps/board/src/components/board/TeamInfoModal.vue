<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import { Chart } from "highcharts-vue";

const props = defineProps<{
  isHidden: boolean;

  rank: Rank;
  team: Team;
}>();

const emit = defineEmits(["update:isHidden"]);

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const currentType = ref("info");

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const headerTitle = computed(() => {
  let res = "";

  if (rank.value.contest.organization && team.value.organization.length > 0) {
    res += `${team.value.organization} - `;
  }

  res += `${team.value.name.getOrDefault(lang.value)}`;

  return res;
});

const TYPE_INFO = "info";
const TYPE_SUBMISSIONS = "submissions";
const TYPE_STATISTICS = "statistics";
const TYPE_AWARDS = "awards";
const types = [TYPE_INFO, TYPE_SUBMISSIONS, TYPE_STATISTICS, TYPE_AWARDS];
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
  >
    <template #header>
      <div
        w-full max-w-screen-xl
        px-4 mx-auto lg:px-12
      >
        <div
          relative overflow-hidden
          bg-white dark:bg-gray-800
        >
          <div
            flex flex-col items-center justify-between
            md:flex-row
            space-y-3 md:space-y-0
          >
            <div
              flex flex-row
              space-x-3
            >
              <Badge
                v-if="team.badge"
                :image="team.badge"
                width-class="h-8 w-8"
              />

              <Tooltip>
                <h3
                  text-gray-900 dark:text-white
                  text-2xl
                  font-sans font-semibold italic
                >
                  {{ headerTitle }}
                </h3>

                <template #popper>
                  <div
                    flex flex-col
                    justify-start items-start
                  >
                    <div>
                      TeamID: {{ team.id }}
                    </div>
                  </div>
                </template>
              </Tooltip>
            </div>

            <ModalMenu
              v-model:current-type="currentType"
              :types="types"
            />
          </div>
        </div>
      </div>
    </template>

    <div
      w-full
      font-bold font-mono
      flex items-center justify-center
    >
      <div
        v-if="currentType === TYPE_INFO"
        w-full
      >
        <TeamInfo
          :rank="rank"
          :team="team"
        />
      </div>

      <div
        v-if="currentType === TYPE_SUBMISSIONS"
        w-full
        class="mt-[-12px]"
      >
        <SubmissionsTable
          w-full
          :rank="rank"
          :submissions="team.submissions"
          :page-size="8"
          :remove-border="true"
        />
      </div>

      <div
        v-if="currentType === TYPE_STATISTICS"
        w-full
      >
        <Chart
          :options="getTeamPlaceChart(rank, team)"
        />
      </div>

      <div
        v-if="currentType === TYPE_AWARDS"
        w-full
      >
        <TeamAwards
          :team="team"
          :rank="rank"
        />
      </div>
    </div>
  </Modal>
</template>
