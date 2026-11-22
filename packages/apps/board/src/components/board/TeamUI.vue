<script setup lang="ts">
import type { GiantsType, Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { getStandClassName as getStandClassNameHelper } from "@board/composables/standings";

const props = defineProps<{
  ix: number;
  rank: Rank;
  team: Team;
  isFilter?: boolean;
  giantsType?: GiantsType;
  hideOrganization?: boolean;
  isCompactLayout?: boolean;
  isStickyLayout?: boolean;
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

const isCompact = computed(() => !!props.isCompactLayout || !!props.isStickyLayout);

// In the compact layout the org column is merged into the team cell, so the org
// logo takes over the full-height badge slot on the left.
const bigBadge = computed(() => {
  if (isCompact.value && showOrganization.value && team.value.organization?.logo) {
    return team.value.organization.logo;
  }

  return team.value.badge;
});

const showInlineTeamBadge = computed(() => {
  return isCompact.value && !!team.value.badge && bigBadge.value !== team.value.badge;
});

const badgeClass = computed(() => {
  return props.isStickyLayout
    ? "absolute left-0 top-0 bottom-0 w-9 px-0.5"
    : "absolute left-0 top-0 bottom-0 px-1 w-12";
});

const badgePaddingClass = computed(() => {
  if (!bigBadge.value) {
    return "";
  }

  return props.isStickyLayout ? "pl-9" : "pl-10";
});

const nameLineClass = computed(() => {
  return props.isStickyLayout ? "line-clamp-1" : "line-clamp-2";
});

function getStandClassName(t: Team, isRankField = false): string {
  return getStandClassNameHelper(rank.value, t, props.ix, {
    isRankField,
    isFilter: props.isFilter,
    giantsType: props.giantsType,
  });
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
      :class="[getStandClassName(team, true), props.isStickyLayout ? 'm-sticky m-place' : '']"
    >
      {{ team.rank }}
    </td>
    <td
      v-if="showOrganization && !isCompact && isRenderByVisible()"
      class="stnd relative"
      :class="[getStandClassName(team)]"
    >
      <Badge
        :image="team?.organization?.logo"
        :class="badgeClass"
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
      :class="[getStandClassName(team), props.isStickyLayout ? 'm-sticky m-team' : '']"
    >
      <Badge
        :image="bigBadge"
        :class="badgeClass"
      />
      <div
        flex flex-col items-center justify-center
        cursor-pointer
        :class="badgePaddingClass"
        @click="onClickTeamModal"
      >
        <div flex items-center>
          <Badge
            v-if="showInlineTeamBadge"
            :image="team.badge"
            class="mr-1 h-3.5 w-3.5 shrink-0"
          />
          <span :class="nameLineClass">{{ teamName }}</span>
          <span v-if="team.group.includes('unofficial')" class="i-line-md:star-alt-filled" />
          <span v-if="team.group.includes('girl')" class="i-tabler:flower-filled" />
        </div>

        <div
          v-if="isCompact && showOrganization && team.organization"
          class="team-org-line mt-0.5 flex cursor-pointer items-center justify-center gap-1 text-[10px] leading-tight opacity-70"
          @click.stop="onClickOrgModal"
        >
          <span
            v-if="team.isFirstRankOfOrganization"
            class="shrink-0 font-bold"
          >
            {{ team.organization.rank }}
          </span>
          <span :class="nameLineClass">{{ team.organization.name.getOrDefault(lang) }}</span>
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
      :class="[getStandClassName(team), props.isStickyLayout ? 'm-sticky m-solved' : '']"
    >
      {{ team.solvedProblemNum }}
    </td>

    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team), props.isStickyLayout ? 'm-sticky m-penalty' : '']"
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
