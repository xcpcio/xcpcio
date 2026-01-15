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
const TYPE_OVERVIEW = "overview";
const TYPE_SUBMISSIONS = "submissions";
const TYPE_STATISTICS = "statistics";
const TYPE_STREAMS = "streams";

const types = computed(() => {
  const baseTypes = [TYPE_OVERVIEW, TYPE_SUBMISSIONS, TYPE_STATISTICS];
  const options = props.rank.contest.options;
  if (options.teamWebcamStreamUrlTemplate || options.teamScreenStreamUrlTemplate) {
    baseTypes.push(TYPE_STREAMS);
  }
  return baseTypes;
});

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

const currentType = ref(TYPE_OVERVIEW);

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const headerTitle = computed(() => {
  let res = "";

  if (rank.value.contest.organization && !!team.value.organization) {
    res += `${team.value.organization.name.getOrDefault(lang.value)} - `;
  }

  res += `${team.value.name.getOrDefault(lang.value)}`;

  return res;
});
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    mt="md:mt-8 sm:mt-4"
  >
    <template #header>
      <div
        w-full max-w-screen-xl
        px-4 lg:px-12
        mx-auto
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
              flex flex-row items-center justify-center
              space-x-4
            >
              <Badge
                v-if="team.badge"
                :image="team.badge"
                width-class="h-16 w-16"
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
                    <div v-if="team.icpcID && team.icpcID.length > 0">
                      ICPC ID: {{ team.icpcID }}
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
        v-if="currentType === TYPE_OVERVIEW"
        w-full
      >
        <TeamOverview
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
        v-if="currentType === TYPE_STREAMS"
        w-full
      >
        <TeamStreams
          :rank="rank"
          :team="team"
        />
      </div>
    </div>
  </Modal>
</template>
