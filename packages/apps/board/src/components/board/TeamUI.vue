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
  isCompactLayout?: boolean;
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

// In the compact layout the org column is merged into the team cell, so the org
// logo takes over the full-height badge slot on the left.
const bigBadge = computed(() => {
  if (props.isCompactLayout && showOrganization.value && team.value.organization?.logo) {
    return team.value.organization.logo;
  }

  return team.value.badge;
});

const showInlineTeamBadge = computed(() => {
  return props.isCompactLayout && !!team.value.badge && bigBadge.value !== team.value.badge;
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
      v-if="showOrganization && !props.isCompactLayout && isRenderByVisible()"
      class="stnd relative"
      :class="[getStandClassName(team)]"
    >
      <Badge
        :image="team?.organization?.logo"
        class="absolute left-0 top-0 bottom-0 px-1 w-12"
      />
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
          line-clamp-2
          @click="onClickOrgModal"
        >
          {{ team.organization?.name.getOrDefault(lang) }}
        </div>
        <div float-right />
      </div>
    </td>

    <td
      v-if="isRenderByVisible()"
      class="stnd relative"
      :class="[getStandClassName(team)]"
    >
      <Badge
        :image="bigBadge"
        class="absolute left-0 top-0 bottom-0 px-1 w-12"
      />
      <div
        flex flex-col items-center justify-center
        cursor-pointer
        :class="bigBadge ? 'pl-10' : ''"
        @click="onClickTeamModal"
      >
        <div flex items-center>
          <Badge
            v-if="showInlineTeamBadge"
            :image="team.badge"
            class="mr-1 h-3.5 w-3.5 shrink-0"
          />
          <span line-clamp-2>{{ teamName }}</span>
          <span v-if="team.group.includes('unofficial')" class="i-line-md:star-alt-filled" />
          <span v-if="team.group.includes('girl')" class="i-tabler:flower-filled" />
        </div>

        <div
          v-if="props.isCompactLayout && showOrganization && team.organization"
          class="mt-0.5 flex cursor-pointer items-center justify-center gap-1 text-[10px] leading-tight opacity-70"
          @click.stop="onClickOrgModal"
        >
          <span
            v-if="team.isFirstRankOfOrganization"
            class="shrink-0 font-bold"
          >
            {{ team.organization.rank }}
          </span>
          <span line-clamp-2>{{ team.organization.name.getOrDefault(lang) }}</span>
        </div>
      </div>

      <div>
        <TeamModal
          v-if="!hiddenTeamModal"
          v-model:is-hidden="hiddenTeamModal"
          :rank="rank"
          :team="team"
        />

        <OrgModal
          v-if="showOrganization && !hiddenOrgModal && team.organization"
          v-model:is-hidden="hiddenOrgModal"
          :rank="rank"
          :organization="team.organization"
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
