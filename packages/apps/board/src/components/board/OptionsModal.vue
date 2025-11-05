<script setup lang="ts">
import type { Rank, RankOptions } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import _ from "lodash";

const props = defineProps<{
  isHidden: boolean;

  rank: Rank;
  rankOptions: RankOptions;
}>();

const emit = defineEmits([
  "update:isHidden",
  "update:rankOptions",
]);

const beforeRankOptions = _.cloneDeep(props.rankOptions);

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const rankOptions = computed({
  get() {
    return props.rankOptions;
  },
  set(value) {
    emit("update:rankOptions", value);
  },
});

const rank = computed(() => props.rank);

const title = computed(() => {
  return t("type_menu.options");
});

const orgOptions = computed(() => {
  const res = rank.value.organizations.map((o) => {
    return {
      value: o.id,
      text: o.name.getOrDefault(lang.value),
    };
  });

  return res;
});

const teamsOptions = computed(() => {
  const res = rank.value.originTeams.map((t) => {
    const teamName = t.name.getOrDefault(lang.value);
    const orgName = t.organization?.name.getOrDefault(lang.value);
    return {
      value: t.id,
      text: orgName ? `${teamName} - ${orgName}` : teamName,
    };
  });

  return res;
});

const routeQueryForBattleOfGiants = useQueryForBattleOfGiants();
function persistBattleOfGiants() {
  if (rankOptions.value.battleOfGiants.persist) {
    routeQueryForBattleOfGiants.value = rankOptions.value.battleOfGiants.ToBase64();
  } else {
    routeQueryForBattleOfGiants.value = undefined as unknown as string;
  }
}

watch(
  () => rankOptions.value.battleOfGiants.persist,
  () => {
    persistBattleOfGiants();
  },
);

async function onCancel() {
  rankOptions.value.setSelf(beforeRankOptions);
  await nextTick();
  persistBattleOfGiants();

  isHidden.value = true;
}

async function onBeforeClose() {
  await onCancel();
}

function onConfirm() {
  persistBattleOfGiants();
  isHidden.value = true;
}
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    :title="title"
    width="w-200"
    mt="mt-4"
    @on-before-close="onBeforeClose"
  >
    <div
      w-full
      font-bold font-mono text-base
      flex flex-col gap-4
      items-center justify-center
    >
      <div
        flex flex-col
        w-full
      >
        <div
          flex
        >
          Feature
        </div>

        <div
          ml-4 mt-2
        >
          <div
            flex flex-row
          >
            <TheCheckbox
              v-model="rankOptions.enableAnimatedSubmissions"
            >
              <span
                ml-3
                text-sm font-medium
                text-gray-900 dark:text-gray-300
              >
                Submission Queue
              </span>
            </TheCheckbox>
          </div>
        </div>
      </div>

      <div
        flex flex-col w-full
      >
        <div
          flex
        >
          Battle of Giants
        </div>

        <div
          ml-4 mt-2
        >
          <div
            grid grid-cols-8
            items-center
          >
            <span
              text-sm font-medium
              text-gray-900 dark:text-gray-300
            >
              Enable
            </span>

            <TheCheckbox
              v-model="rankOptions.battleOfGiants.enable"
            />

            <span
              text-sm font-medium
              text-gray-900 dark:text-gray-300
            >
              Equal Teams
            </span>

            <TheCheckbox
              v-model="rankOptions.battleOfGiants.equalTeams"
            />

            <span
              text-sm font-medium
              text-gray-900 dark:text-gray-300
            >
              Persist
            </span>

            <TheCheckbox
              v-model="rankOptions.battleOfGiants.persist"
            />

            <span
              text-sm font-medium
              text-gray-900 dark:text-gray-300
            >
              TopX
            </span>

            <TheInput
              v-model="rankOptions.battleOfGiants.topX"
              text-align="left"
              text-type="number"
            />
          </div>
        </div>

        <GiantsOptions
          :rank="rank"
          :org-options="orgOptions"
          :teams-options="teamsOptions"
          :giants="rankOptions.battleOfGiants.blueTeam"
        />

        <GiantsOptions
          :rank="rank"
          :org-options="orgOptions"
          :teams-options="teamsOptions"
          :giants="rankOptions.battleOfGiants.redTeam"
        />
      </div>

      <div
        w-full
        flex flex-row-reverse items-center
        gap-x-4
      >
        <button
          type="submit"
          class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          font-medium text-sm
          rounded-md
          @click="onConfirm"
        >
          {{ t("button.confirm") }}
        </button>
        <button
          type="reset"
          class="py-2.5 px-5 text-gray-900 focus:outline-none bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          font-medium text-sm
          rounded-md
          @click="onCancel"
        >
          {{ t("button.cancel") }}
        </button>
      </div>
    </div>
  </Modal>
</template>
