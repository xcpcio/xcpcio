<script setup lang="ts">
import { Rank } from "@xcpcio/core";

const props = defineProps({
  rank: {
    type: Rank,
    required: true,
  },
});

const { t } = useI18n();

const rank = reactive(props.rank);
</script>

<template>
  <div class="mt-5">
    <div>
      <table class="standings font-mono">
        <thead>
          <tr>
            <th class="title" style="width: 12em;">
              {{ t("standings.place") }}
            </th>
            <th v-if="rank.contest.organization" class="title">
              {{ rank.contest.organization }}
            </th>
            <th class="title">
              {{ t("standings.team") }}
            </th>
            <th class="title">
              {{ t("standings.solved") }}
            </th>
            <th class="title">
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
          <tr
            v-for="team in rank.teams"
            :key="team.id"
            class="stand team"
          >
            <td class="empty">
              {{ team.rank }}
            </td>
            <td v-if="rank.contest.organization" class="stnd">
              {{ team.organization }}
            </td>
            <td class="stnd">
              {{ team.name }}
            </td>
            <td class="stnd">
              {{ team.solvedProblemNum }}
            </td>
            <td class="stnd">
              {{ team.penaltyToMinute() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
