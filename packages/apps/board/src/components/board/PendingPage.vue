<script setup lang="ts">
import type { Rank, SelectOptionItem } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import type { SegmentedControlOption } from "../common/SegmentedControl.vue";

const props = defineProps<{
  rank: Rank;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);

// Tab state - only show seat map tab if config exists
const hasSeatMap = computed(() => !!rank.value.contest.seatMap);
const currentTab = ref<"teams" | "seat-map">("teams");

const tabOptions = computed<SegmentedControlOption[]>(() => [
  { value: "teams", label: t("pending_page.teams_tab") },
  { value: "seat-map", label: t("pending_page.seat_map_tab") },
]);

const orgOptions = computed(() => {
  return rank.value.organizations.map((o) => {
    return {
      value: o.id,
      text: o.name.getOrDefault(lang.value),
    };
  });
});

const orgSelectedItems = ref<Array<SelectOptionItem>>([]);
const orgLastSelectItem = ref({});

function orgOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  orgSelectedItems.value = selectedItems;
  orgLastSelectItem.value = lastSelectItem;
}

const teamsOptions = computed(() => {
  return rank.value.originTeams.map((t) => {
    const teamName = t.name.getOrDefault(lang.value);
    const orgName = t.organization?.name.getOrDefault(lang.value);
    return {
      value: t.id,
      text: orgName ? `${teamName} - ${orgName}` : teamName,
    };
  });
});

const teamsSelectedItems = ref<Array<SelectOptionItem>>([]);
const teamsLastSelectItem = ref({});

function teamsOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  teamsSelectedItems.value = selectedItems;
  teamsLastSelectItem.value = lastSelectItem;
}

const groupSelectedItems = ref<Array<SelectOptionItem>>([]);
const groupLastSelectItem = ref({});

function groupOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  groupSelectedItems.value = selectedItems;
  groupLastSelectItem.value = lastSelectItem;
}

const groupOptions = computed(() => {
  const groups = rank.value.contest.group;
  return Array.from(groups)
    .filter(([key]) => key !== "all")
    .map(([key, group]) => ({
      value: key,
      text: group.name.getOrDefault(lang.value),
    }));
});

const filteredTeams = computed(() => {
  let teams = rank.value.originTeams;

  // Group filter
  const groupIds = groupSelectedItems.value.map(g => g.value);
  if (groupIds.length > 0) {
    teams = teams.filter(team => team.group?.some(g => groupIds.includes(g)));
  }

  // Org and Team filter (from MultiSelect)
  const orgIds = orgSelectedItems.value.map(o => o.value);
  const teamIds = teamsSelectedItems.value.map(t => t.value);

  if (orgIds.length === 0 && teamIds.length === 0) {
    return teams;
  }

  return teams.filter((team) => {
    if (teamIds.length > 0 && teamIds.includes(team.id)) {
      return true;
    }
    if (orgIds.length > 0 && orgIds.includes(team.organization?.id ?? "")) {
      return true;
    }
    return false;
  });
});

const hasTeams = computed(() => filteredTeams.value.length > 0);
const hasFilters = computed(() => {
  return rank.value.organizations.length > 0
    || rank.value.originTeams.length > 0
    || rank.value.contest.group.size > 0;
});

// Compute filtered team IDs for seat map highlighting
const filteredTeamIds = computed(() => {
  return new Set(filteredTeams.value.map(t => t.id));
});
</script>

<template>
  <div class="w-full">
    <div
      v-if="hasFilters || hasSeatMap"
      class="filter-bar dark:bg-gray-800/30 border-gray-200/50 dark:border-gray-700/30"
      flex="~ wrap gap-3 items-center"
      mb-6
      p-4
      bg-white
      rounded-xl
      border
    >
      <!-- Filters on the left -->
      <div flex="~ wrap gap-3 items-center" flex-1>
        <div
          v-if="groupOptions.length > 0"
          w-48
        >
          <TheMultiSelect
            :options="groupOptions"
            :selected-options="groupSelectedItems"
            :placeholder="t('standings.group')"
            @select="groupOnSelect"
          />
        </div>

        <div
          v-if="rank.contest.options.enableOrganization && orgOptions.length > 0"
          w-80
        >
          <TheMultiSelect
            :options="orgOptions"
            :selected-options="orgSelectedItems"
            :placeholder="t('standings.organization')"
            @select="orgOnSelect"
          />
        </div>

        <div
          v-if="teamsOptions.length > 0"
          w-80
        >
          <TheMultiSelect
            :options="teamsOptions"
            :selected-options="teamsSelectedItems"
            :placeholder="t('standings.team')"
            @select="teamsOnSelect"
          />
        </div>
      </div>

      <!-- Tab switcher on the right side -->
      <SegmentedControl
        v-if="hasSeatMap"
        v-model="currentTab"
        :options="tabOptions"
      />
    </div>

    <!-- Teams Grid View -->
    <template v-if="currentTab === 'teams'">
      <div
        v-if="hasTeams"
        class="grid gap-4"
        grid="~ cols-1 sm:cols-2 lg:cols-3 xl:cols-4"
      >
        <TeamCard
          v-for="team in filteredTeams"
          :key="team.id"
          :rank="rank"
          :team="team"
        />
      </div>

      <div
        v-else
        flex="~ col items-center justify-center"
        py="12"
        text="gray-500 dark:gray-400"
      >
        <span text="lg">{{ t("pending_page.no_teams") }}</span>
      </div>
    </template>

    <!-- Seat Map View -->
    <template v-else-if="currentTab === 'seat-map' && hasSeatMap">
      <SeatMapView
        :rank="rank"
        :seat-map="rank.contest.seatMap!"
        :filtered-team-ids="filteredTeamIds"
        :all-teams="rank.originTeams"
      />
    </template>
  </div>
</template>
