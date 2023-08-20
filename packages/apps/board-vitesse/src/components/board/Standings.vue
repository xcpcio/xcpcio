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
        <thead>
          <tr>
            <th class="title" style="width: 4em;">
              {{ t("standings.place") }}
            </th>
            <th v-if="rank.contest.badge" class="title" style="min-width: 3em;">
              {{ rank.contest.badge }}
            </th>
            <th v-if="rank.contest.organization" class="title" style="min-width: 12em;">
              {{ rank.contest.organization }}
            </th>
            <th class="title" style="min-width: 12em;">
              {{ t("standings.team") }}
            </th>
            <th class="title" style="width: 3em;">
              {{ t("standings.solved") }}
            </th>
            <th class="title" style="width: 5em;">
              {{ t("standings.penalty") }}
            </th>
            <th
              v-for="p in rank.contest.problems"
              :key="p.id"
              class="success"
              style="width: 4em;"
              :style="{
                'background-color': p.balloonColor?.background_color,
                'color': p.balloonColor?.color,
              }"
            >
              {{ p.label }}
              <br>
              <s>{{ p.statistics.acceptedNum }}</s>
            </th>
            <th class="title">
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
