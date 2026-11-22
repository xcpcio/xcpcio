<script setup lang="ts">
import type { Rank, Teams } from "@xcpcio/core";

import GiantsScoreBoard from "@board/components/battle-of-giants/GiantsScoreBoard.vue";
import OrgModal from "@board/components/board/OrgModal.vue";
import StandingsMobileTable from "@board/components/board/StandingsMobileTable.vue";
import StandingsTeamCard from "@board/components/board/StandingsTeamCard.vue";
import SubmissionsTableModal from "@board/components/board/SubmissionsTableModal.vue";
import TeamModal from "@board/components/board/TeamModal.vue";
import { useStandingsLists } from "@board/composables/useStandingsLists";

const props = defineProps<{
  rank: Rank;
  teams?: Teams;
  hideOrganization?: boolean;
}>();

const { rankOptions, teams: allTeams, filterTeams, giantTeams } = useStandingsLists(() => props.rank);

const showFullStandings = computed(() => props.teams === undefined);
const displayTeams = computed(() => props.teams ?? allTeams.value);

const selectedTeamId = ref<string | null>(null);
const selectedOrgId = ref<string | null>(null);
const selectedProblem = ref<{ teamId: string; problemId: string } | null>(null);

const selectedTeam = computed(() => {
  return selectedTeamId.value ? props.rank.teamsMap.get(selectedTeamId.value) : undefined;
});

const selectedOrganization = computed(() => {
  return selectedOrgId.value ? props.rank.organizationsMap.get(selectedOrgId.value) : undefined;
});

const selectedProblemTeam = computed(() => {
  return selectedProblem.value ? props.rank.teamsMap.get(selectedProblem.value.teamId) : undefined;
});

const selectedProblemStatistics = computed(() => {
  if (!selectedProblem.value) {
    return undefined;
  }

  return selectedProblemTeam.value?.problemStatisticsMap.get(selectedProblem.value.problemId);
});

function selectTeam(teamId: string) {
  selectedTeamId.value = teamId;
  selectedOrgId.value = null;
  selectedProblem.value = null;
}

function selectOrganization(organizationId: string) {
  selectedOrgId.value = organizationId;
  selectedTeamId.value = null;
  selectedProblem.value = null;
}

function selectProblem(payload: { teamId: string; problemId: string }) {
  selectedProblem.value = payload;
  selectedTeamId.value = null;
  selectedOrgId.value = null;
}
</script>

<template>
  <div
    class="w-full"
    data-testid="standings-mobile"
  >
    <div
      v-if="showFullStandings && rankOptions.battleOfGiants.enable"
      class="mb-4"
    >
      <GiantsScoreBoard
        :battle-of-giants="rankOptions.battleOfGiants"
      />
    </div>

    <template v-if="showFullStandings">
      <StandingsMobileTable
        :rank="rank"
        :teams="allTeams"
        :filter-teams="filterTeams"
        :giant-teams="giantTeams"
        @select-team="selectTeam"
        @select-org="selectOrganization"
        @select-problem="selectProblem"
      />
    </template>

    <div
      v-else
      class="flex flex-col gap-2"
    >
      <StandingsTeamCard
        v-for="(team, ix) in displayTeams"
        :key="team.id"
        :ix="ix"
        :rank="rank"
        :team="team"
        :hide-organization="props.hideOrganization"
        @select-team="selectTeam"
        @select-org="selectOrganization"
        @select-problem="selectProblem"
      />
    </div>

    <TeamModal
      v-if="selectedTeam"
      :key="selectedTeam.id"
      :is-hidden="false"
      :rank="rank"
      :team="selectedTeam"
      @update:is-hidden="selectedTeamId = null"
    />

    <OrgModal
      v-if="selectedOrganization"
      :key="selectedOrganization.id"
      :is-hidden="false"
      :rank="rank"
      :organization="selectedOrganization"
      @update:is-hidden="selectedOrgId = null"
    />

    <SubmissionsTableModal
      v-if="selectedProblemTeam && selectedProblemStatistics"
      :key="`${selectedProblemTeam.id}-${selectedProblemStatistics.problem.id}`"
      :is-hidden="false"
      :rank="rank"
      :team="selectedProblemTeam"
      :p="selectedProblemStatistics"
      @update:is-hidden="selectedProblem = null"
    />
  </div>
</template>
