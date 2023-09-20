<script setup lang="ts">
import { Chart } from "highcharts-vue";

import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  isHidden: boolean,

  rank: Rank,
  team: Team,
}>();

const emit = defineEmits(["update:isHidden"]);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const currentType = ref("submissions");

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const headerTitle = computed(() => {
  let res = "";

  if (rank.value.contest.organization && team.value.organization.length > 0) {
    res += `${team.value.organization} - `;
  }

  res += `${team.value.name}`;

  if (team.value.members) {
    res += ` - ${team.value.members}`;
  }

  if (team.value.coach) {
    res += ` - ${team.value.coach}(coach)`;
  }

  return res;
});

const TYPE_SUBMISSIONS = "submissions";
const TYPE_STATISTICS = "statistics";
const TYPE_BALLOON = "balloon";
const types = [TYPE_SUBMISSIONS, TYPE_STATISTICS, TYPE_BALLOON];
</script>

<template>
  <Modal
    v-model:isHidden="isHidden"
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
            space-y-3 md:space-y-0 md:space-x-4
          >
            <h3
              text-gray-900 dark:text-white
              text-xl
              font-sans font-semibold italic
            >
              {{ headerTitle }}
            </h3>

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
        v-if="currentType === TYPE_BALLOON"
        w-full
      >
        <Balloon />
      </div>
    </div>
  </Modal>
</template>
