<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { GiantsType, MedalType } from "@xcpcio/core";

const props = defineProps<{
  ix: number;
  rank: Rank;
  team: Team;
  isFilter?: boolean;
  giantsType?: GiantsType;
  hideOrganization?: boolean;
}>();

const el = ref(null);
const isVisible = useElementVisibility(el);

const hiddenTeamModal = ref(true);
function onClickTeamModal() {
  hiddenTeamModal.value = false;
}

const hiddenOrgModal = ref(true);
function onClickOrgModal() {
  hiddenOrgModal.value = false;
}

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);
const team = computed(() => props.team);
const teamName = computed(() => team.value.name.getOrDefault(lang.value));

const showOrganization = computed(() => {
  return rank.value.contest.options.enableOrganization && !props.hideOrganization;
});

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

  if (props.giantsType !== undefined) {
    switch (props.giantsType) {
      case GiantsType.BLUE:
        return "bg-blue-400";
      case GiantsType.RED:
        return "bg-red-400";
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
    :class="[
      props.isFilter ? 'filter-team' : '',
      props.giantsType !== undefined ? getStandClassName(props.team) : '',
    ]"
  >
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team, true)]"
    >
      {{ team.rank }}
    </td>
    <td
      v-if="showOrganization && isRenderByVisible()"
      class="stnd relative"
      :class="[getStandClassName(team)]"
    >
      <div
        v-if="team?.organization?.logo"
        class="absolute left-0 top-0 bottom-0 flex items-center px-1"
      >
        <Badge
          :image="team?.organization?.logo"
          width-class="h-full w-auto"
        />
      </div>
      <div flex flex-1 :class="team?.organization?.logo ? 'pl-10' : ''">
        <div
          float-left pl-2
        >
          <div
            v-if="!!team.organization && team.isFirstRankOfOrganization"
          >
            {{ team.organization.rank }}
          </div>
        </div>
        <div
          flex-1
          cursor-pointer
          @click="onClickOrgModal"
        >
          {{ team.organization?.name.getOrDefault(lang) }}
        </div>
        <div float-right />
      </div>

      <div>
        <OrgModal
          v-if="!hiddenOrgModal && team.organization"
          v-model:is-hidden="hiddenOrgModal"
          :rank="rank"
          :organization="team.organization"
        />
      </div>
    </td>

    <td
      v-if="isRenderByVisible()"
      class="stnd relative"
      :class="[getStandClassName(team)]"
    >
      <div
        v-if="team.badge"
        class="absolute left-0 top-0 bottom-0 flex items-center px-1"
      >
        <Badge
          :image="team.badge"
          width-class="h-full w-auto"
        />
      </div>
      <div
        flex items-center justify-center cursor-pointer
        :class="team.badge ? 'pl-10' : ''"
        @click="onClickTeamModal"
      >
        <span>{{ teamName }}</span>
        <span v-if="team.group.includes('unofficial')" class="i-line-md:star-alt-filled" />
        <span v-if="team.group.includes('girl')" class="i-tabler:flower-filled" />
      </div>

      <div>
        <TeamModal
          v-if="!hiddenTeamModal"
          v-model:is-hidden="hiddenTeamModal"
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
