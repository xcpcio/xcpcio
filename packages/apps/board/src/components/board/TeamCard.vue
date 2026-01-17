<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { getImageSource } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const cardRef = ref<HTMLElement | null>(null);
const isVisible = useElementVisibility(cardRef);

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const teamName = computed(() => team.value.name.getOrDefault(lang.value));
const organizationName = computed(() => team.value.organization?.name.getOrDefault(lang.value));
const membersStr = computed(() => team.value.membersToString(lang.value));
const coachesStr = computed(() => team.value.coachesToString(lang.value));

const groupNames = computed(() => {
  return team.value.group
    .map((groupId) => {
      const group = rank.value.contest.group.get(groupId);
      return group ? group.name.getOrDefault(lang.value) : groupId;
    })
    .filter(name => name && name !== "all");
});

const isUnofficial = computed(() => team.value.isUnofficial);
const isGirl = computed(() => team.value.isGirl);
</script>

<template>
  <div
    ref="cardRef"
    class="team-card"
    bg="white dark:gray-800"
    rounded="sm"
    shadow="sm hover:md"
    p="4"
    border="1 gray-200 dark:gray-700"
    transition="shadow duration-200"
  >
    <template v-if="isVisible">
      <div flex="~ items-center gap-3" mb="2">
        <img
          v-if="team.organization?.logo"
          :src="getImageSource(team.organization.logo)"
          alt="org logo"
          class="h-12 w-12"
        >
        <img
          v-if="team.badge && (team.badge.base64 || team.badge.url)"
          :src="getImageSource(team.badge)"
          alt="team badge"
          class="h-12 w-12"
        >
        <div flex="1 ~ col" min-w-0>
          <HeatMapTooltip position="top">
            <div
              text="lg gray-900 dark:white"
              font="semibold"
              class="line-clamp-1"
            >
              {{ teamName }}
              <span v-if="isUnofficial" class="i-line-md:star-alt-filled" text="sm" />
              <span v-if="isGirl" class="i-tabler:gender-female" text="sm pink-500" />
            </div>
            <template #tooltip-content>
              <div>{{ t("team_info.team_id") }}{{ t("common.colon") }}{{ team.id }}</div>
              <div>{{ t("team_info.team_name") }}{{ t("common.colon") }}{{ teamName }}</div>
            </template>
          </HeatMapTooltip>
          <HeatMapTooltip v-if="organizationName" position="top">
            <div
              text="sm gray-500 dark:gray-400"
              class="line-clamp-1"
            >
              {{ organizationName }}
            </div>
            <template #tooltip-content>
              <div>{{ t("team_info.org_id") }}{{ t("common.colon") }}{{ team.organization?.id }}</div>
              <div>{{ t("team_info.org_name") }}{{ t("common.colon") }}{{ organizationName }}</div>
            </template>
          </HeatMapTooltip>
        </div>
      </div>

      <div v-if="groupNames.length > 0" flex="~ wrap gap-1" mb="2">
        <span
          v-for="(name, idx) in groupNames"
          :key="idx"
          text="xs"
          px="2" py="0.5"
          rounded="full"
          bg="blue-100 dark:blue-900"
          text-color="blue-800 dark:blue-200"
        >
          {{ name }}
        </span>
      </div>

      <div v-if="membersStr" text="sm gray-700 dark:gray-300" mb="1">
        <span font="medium">{{ t("team_info.members") }}{{ t("common.colon") }}</span> {{ membersStr }}
      </div>

      <div v-if="coachesStr" text="sm gray-600 dark:gray-400">
        <span font="medium">{{ t("team_info.coaches") }}{{ t("common.colon") }}</span> {{ coachesStr }}
      </div>

      <div v-if="team.tag.length > 0" flex="~ wrap gap-1" mt="2">
        <span
          v-for="(tag, idx) in team.tag"
          :key="idx"
          text="xs"
          px="2" py="0.5"
          rounded="full"
          bg="gray-100 dark:gray-700"
          text-color="gray-600 dark:gray-300"
        >
          {{ tag }}
        </span>
      </div>
    </template>

    <div v-else class="h-32" />
  </div>
</template>
