<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

const props = defineProps<{
  isHidden: boolean;
  rank: Rank;
}>();

const emit = defineEmits(["update:isHidden"]);

const { t } = useI18n();

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const rank = computed(() => props.rank);
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    :title="t('type_menu.info')"
    width="w-80"
    mt="mt-16"
  >
    <div
      w-full
      font-bold font-mono text-base
      flex flex-col gap-6
    >
      <!-- Penalty Calculation Section -->
      <div
        flex flex-col w-full
      >
        <div
          text-lg mb-2
        >
          {{ t("standings.options.calculation_of_penalty") }}
        </div>
        <div
          ml-4
          text-sm font-normal
        >
          {{ t(`standings.options.${rank.contest.options?.calculationOfPenalty}`) }}
        </div>
      </div>

      <!-- Color Legend Section -->
      <div
        flex flex-col w-full
      >
        <div
          text-lg mb-2
        >
          {{ t("info_modal.color_legend") }}
        </div>
        <div
          ml-4
          flex items-center justify-center
          dark:text-black
        >
          <table w-full>
            <tbody>
              <tr>
                <td class="gold text-center">
                  Gold
                </td>
              </tr>
              <tr>
                <td class="silver text-center">
                  Silver
                </td>
              </tr>
              <tr>
                <td class="bronze text-center">
                  Bronze
                </td>
              </tr>
              <tr>
                <td class="honorable text-center">
                  Honorable
                </td>
              </tr>
              <tr>
                <td class="first-solve text-center">
                  First to solve problem
                </td>
              </tr>
              <tr>
                <td class="correct text-center">
                  Solved problem
                </td>
              </tr>
              <tr>
                <td class="incorrect text-center">
                  Attempted problem
                </td>
              </tr>
              <tr>
                <td class="pending text-center">
                  Pending judgement/Frozen
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
