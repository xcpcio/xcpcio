<script setup lang="ts">
import { MedalType } from "@xcpcio/core";
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  ix: number,
  rank: Rank,
  team: Team,
  isFilter?: boolean;
}>();

const el = ref(null);
const isVisible = useElementVisibility(el);

const hiddenTeamInfoModal = ref(true);
function onClickTeamInfoModal() {
  hiddenTeamInfoModal.value = false;
}

const rank = computed(() => props.rank);
const team = computed(() => props.team);

function getStandClassName(t: Team, isRankField = false): string {
  if (isRankField) {
    if (t.awards.includes(MedalType.GOLD)) {
      return "gold";
    }

    if (t.awards.includes(MedalType.SILVER)) {
      return "silver";
    }

    if (t.awards.includes(MedalType.BRONZE)) {
      return "bronze";
    }

    if (t.awards.includes(MedalType.HONORABLE)) {
      return "honorable";
    }
  }

  if (props.isFilter) {
    return "filter-team";
  }

  const solvedProblemIndex = (rank.value.rankStatistics.getTeamSolvedNumIndex(t.solvedProblemNum) - 1) % 2;
  const rankIndex = props.ix % 2;

  return `stand${solvedProblemIndex}${rankIndex}`;
}

function isRenderByVisible() {
  // Some teams in the header may have rendering anomalies,
  // so force the first 32 teams to render regardless of their visibility
  // when rank rebuild trigger by drag the progress bar
  return isVisible.value || props.ix < 32;
}
</script>

<template>
  <tr
    ref="el"
    class="h-10"
    :class="[props.isFilter ? 'filter-team' : '']"
  >
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team, true)]"
    >
      {{ team.rank }}
    </td>
    <td
      v-if="rank.contest.badge && team.badge && isRenderByVisible()"
      class="empty flex items-center justify-center"
    >
      <Badge
        :image="team.badge"
        width-class="h-8 w-8"
      />
    </td>
    <td
      v-if="rank.contest.organization && isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      <div flex>
        <div class="float-left pl-2 font-serif">
          <div v-if="team.organizationRank > -1">
            {{ team.organizationRank }}
          </div>
        </div>
        <div class="flex-1">
          {{ team.organization }}
        </div>
        <div class="float-right" />
      </div>
    </td>

    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      <div
        cursor-pointer
        @click="onClickTeamInfoModal"
      >
        <span>{{ team.name }}</span>
        <StarIcon v-if="team.group.includes('unofficial')" inline-block />
        <GirlIcon v-if="team.group.includes('girl')" inline-block />
      </div>

      <div>
        <TeamInfoModal
          v-if="!hiddenTeamInfoModal"
          v-model:isHidden="hiddenTeamInfoModal"
          :rank="rank"
          :team="team"
        />
      </div>
    </td>

    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.solvedProblemNum }}
    </td>

    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.penaltyToMinute }}
    </td>

    <template
      v-for="p in team.problemStatistics"
      :key="p.problem.id"
    >
      <TeamProblemBlock
        v-if="isRenderByVisible()"
        :rank="rank"
        :team="team"
        :p="p"
      />
    </template>
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ `${team.dirt}%` }}
    </td>
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ `${team.se.toFixed(2)}` }}
    </td>
  </tr>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
