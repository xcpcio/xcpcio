<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";

import {
  getProblemColorClass,
  getProblemShow,
  getProblemSign,
} from "@board/composables/standings";

const props = defineProps<{
  rank: Rank;
  team: Team;
  p: TeamProblemStatistics;
}>();

const hiddenModal = ref(true);
function onClick() {
  hiddenModal.value = false;
}

const rank = computed(() => props.rank);
const team = computed(() => props.team);
const p = computed(() => props.p);

const problemSign = computed(() => getProblemSign(p.value));
const problemShow = computed(() => getProblemShow(p.value, rank.value.contest.statusTimeDisplay));
const problemColorClass = computed(() => getProblemColorClass(p.value));
</script>

<template>
  <td
    class="stnd"
    :class="[problemColorClass]"
  >
    <div
      cursor-pointer
      flex flex-col
      justify-center items-center
      @click="onClick"
    >
      <div>
        {{ problemSign }}
      </div>
      <div>
        {{ problemShow }}
      </div>
    </div>

    <div>
      <SubmissionsTableModal
        v-if="!hiddenModal"
        v-model:is-hidden="hiddenModal"
        :rank="rank"
        :team="team"
        :p="p"
      />
    </div>
  </td>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
