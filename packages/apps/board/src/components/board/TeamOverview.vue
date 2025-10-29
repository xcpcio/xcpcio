<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { MedalType } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const photoLoadError = ref(false);
function handlePhotoError() {
  photoLoadError.value = true;
}

const hasPhoto = computed(() => {
  if (team.value.missingPhoto || photoLoadError.value) {
    return false;
  }

  return rank.value.contest.options.teamPhotoTemplate || team.value.photo;
});

const teamPhoto = computed(() => {
  if (team.value.photo?.url) {
    return {
      url: team.value.photo.url,
      width: team.value.photo.width,
      height: team.value.photo.height,
    };
  }

  const template = rank.value.contest.options.teamPhotoTemplate;
  if (template?.url) {
    return {
      url: template.url.replace(/\$\{team_id\}/, team.value.id),
      width: template.width,
      height: template.height,
    };
  }

  return { url: "", width: undefined, height: undefined };
});

const groupNames = computed(() => {
  return team.value.group
    .map((groupId) => {
      const group = rank.value.contest.group.get(groupId);
      return group ? group.name.getOrDefault(lang.value) : groupId;
    })
    .join(", ");
});

const medal = computed(() => {
  if (team.value.awards.includes(MedalType.GOLD)) {
    return {
      emoji: "i-twemoji-1st-place-medal",
      text: t("medal.gold"),
    };
  }

  if (team.value.awards.includes(MedalType.SILVER)) {
    return {
      emoji: "i-twemoji-2nd-place-medal",
      text: t("medal.silver"),
    };
  }

  if (team.value.awards.includes(MedalType.BRONZE)) {
    return {
      emoji: "i-twemoji-3rd-place-medal",
      text: t("medal.bronze"),
    };
  }

  if (team.value.awards.includes(MedalType.HONORABLE)) {
    return {
      text: t("medal.honorable"),
    };
  }

  return null;
});

const tableRows = computed(() => {
  const rows = [
    { label: t("team_info.rank"), value: team.value.rank, show: true },
    { label: t("team_info.team_name"), value: team.value.name.getOrDefault(lang.value), show: true },
    { label: t("team_info.organization"), value: team.value.organization, show: !!team.value.organization },
    { label: t("team_info.group"), value: groupNames.value, show: team.value.group.length > 0 },
    { label: t("team_info.members"), value: team.value.membersToString(lang.value), show: team.value.members.length > 0 },
    { label: t("team_info.coaches"), value: team.value.coachesToString(lang.value), show: team.value.coaches.length > 0 },
    { label: t("team_info.location"), value: team.value.location, show: !!team.value.location },
    { label: t("team_info.award"), value: medal.value?.text, emoji: medal.value?.emoji, show: !!medal.value },
  ];
  return rows.filter(row => row.show);
});
</script>

<template>
  <div
    flex w-full
    :class="hasPhoto ? 'flex-row gap-8' : 'justify-center'"
  >
    <div
      :class="hasPhoto ? 'flex-1' : 'w-1/2'"
      flex items-center justify-center
    >
      <table w-full text-lg text-left text-gray-900 dark:text-gray-100>
        <tbody>
          <tr
            v-for="(row, index) in tableRows"
            :key="row.label"
            :class="index % 2 === 0 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'"
          >
            <td px-4 py-2>
              {{ row.label }}
            </td>
            <td px-4 py-2>
              <span
                v-if="!!row.emoji"
                :class="row.emoji"
                text-xl
              />
              {{ row.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="hasPhoto" flex-1>
      <div flex items-center justify-center>
        <a
          class="max-w-[98%]"
          target="_blank" rel="nofollow" :href="teamPhoto.url"
        >
          <img
            :src="teamPhoto.url"
            :width="teamPhoto.width"
            :height="teamPhoto.height"
            alt="team photo"
            @error="handlePhotoError"
          >
        </a>
      </div>
    </div>
  </div>
</template>
