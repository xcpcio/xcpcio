<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const { t } = useI18n();

const rank = reactive(props.rank);
</script>

<template>
  <div>
    <div>
      <table class="font-mono standings dark:text-gray-700">
        <thead class="z-9999 top-0 sticky">
          <tr>
            <th class="title" style="width: 3rem;">
              {{ t("standings.place") }}
            </th>
            <th v-if="rank.contest.badge" class="title" style="min-width: 3rem;">
              {{ rank.contest.badge }}
            </th>
            <th v-if="rank.contest.organization" class="title" style="min-width: 12rem;">
              {{ rank.contest.organization }}
            </th>
            <th class="title" style="min-width: 12rem;">
              {{ t("standings.team") }}
            </th>
            <th class="title" style="width: 3rem;">
              {{ t("standings.solved") }}
            </th>
            <th class="title" style="width: 4rem;">
              {{ t("standings.penalty") }}
            </th>
            <th
              v-for="p in rank.contest.problems"
              :key="p.id"
              class="success"
              style="width: 3rem;"
              :style="{
                'background-color': p.balloonColor?.background_color,
                'color': p.balloonColor?.color,
              }"
            >
              {{ p.label }}
              <br>
              <s>{{ p.statistics.acceptedNum }}</s>
            </th>
            <th class="title" style="width: 2.5rem;">
              {{ t("standings.dict") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="team in rank.teams"
            :key="team.id"
          >
            <TeamUI
              :rank="rank"
              :team="team"
            />
          </template>

          <BottomStatistics :rank="rank" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
