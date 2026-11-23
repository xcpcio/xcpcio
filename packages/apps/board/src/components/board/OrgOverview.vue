<script setup lang="ts">
import type { Organization, Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
  organization: Organization;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);
const organization = computed(() => props.organization);

const orgTeams = computed(() => {
  return rank.value.teams.filter(t => t.organizationId === organization.value.id);
});

const tableRows = computed(() => {
  const rows = [
    { label: t("org_info.rank"), value: organization.value.rank, show: true },
    { label: t("org_info.name"), value: organization.value.name.getOrDefault(lang.value), show: true },
    { label: t("org_info.icpc_id"), value: organization.value.icpcID, show: !!organization.value.icpcID },
    { label: t("org_info.teams_count"), value: orgTeams.value.length, show: true },
  ];
  return rows.filter(row => row.show);
});
</script>

<template>
  <div
    flex w-full justify-center
  >
    <div
      class="w-1/2"
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
              {{ row.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
