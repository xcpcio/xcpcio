<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  isHidden: boolean,

  rank: Rank,
  team: Team,
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

const currentType = ref("submissions");
function onChangeType(type: string) {
  currentType.value = type;
}

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const headerTitle = computed(() => {
  let res = "";

  if (rank.value.contest.organization && team.value.organization.length > 0) {
    res += `${team.value.organization} - `;
  }

  res += `${team.value.name}`;

  if (team.value.members) {
    res += ` - ${team.value.members}`;
  }

  if (team.value.coach) {
    res += ` - ${team.value.coach}(coach)`;
  }

  return res;
});
</script>

<template>
  <Modal
    v-model:isHidden="isHidden"
  >
    <template #header>
      <div
        w-full max-w-screen-xl
        px-4 mx-auto lg:px-12
      >
        <div
          relative overflow-hidden
          bg-white dark:bg-gray-800
        >
          <div
            flex flex-col items-center justify-between
            md:flex-row
            space-y-3 md:space-y-0 md:space-x-4
          >
            <h3
              text-gray-900 dark:text-white
              text-xl
              font-sans font-semibold italic
            >
              {{ headerTitle }}
            </h3>

            <div
              role="group"
              inline-flex flex-col w-full
              md:w-auto md:flex-row
              rounded-md shadow-sm
            >
              <button
                type="button"
                px-4 py-2 my-2 text-sm font-medium
                text-gray-900 bg-white
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                border border-gray-200
                rounded-t-lg md:rounded-tr-none md:rounded-l-lg
                hover:bg-gray-100 dark:hover:bg-gray-600
                hover:text-primary-700 dark:hover:text-white
                focus:z-10 focus:ring-2
                focus:ring-primary-700 focus:text-primary-700
                dark:focus:ring-primary-500 dark:focus:text-white
                :class="{
                  'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === 'submissions',
                }"
                @click="onChangeType('submissions')"
              >
                {{ t("type_menu.submissions") }}
              </button>
              <button
                type="button"
                px-4 py-2 my-2 text-sm font-medium
                text-gray-900 bg-white
                border-t border-x md:border-x-0 md:border-b
                border-gray-200
                hover:bg-gray-100 hover:text-primary-700
                focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                dark:hover:text-white dark:hover:bg-gray-600
                dark:focus:ring-primary-500 dark:focus:text-white
                :class="{
                  'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === 'statistics',
                }"
                @click="onChangeType('statistics')"
              >
                {{ t("type_menu.statistics") }}
              </button>
              <button
                type="button"
                px-4 py-2 my-2 mr-2 text-sm font-medium
                text-gray-900 bg-white
                border border-gray-200
                rounded-b-lg md:rounded-bl-none md:rounded-r-lg
                hover:bg-gray-100 hover:text-primary-700
                focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700
                dark:bg-gray-700 dark:border-gray-600 dark:text-white
                dark:hover:text-white dark:hover:bg-gray-600
                dark:focus:ring-primary-500 dark:focus:text-white
                :class="{
                  'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === 'balloon',
                }"
                @click="onChangeType('balloon')"
              >
                {{ t("type_menu.balloon") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      w-full
      font-bold font-mono
      flex items-center justify-center
    >
      <div
        v-if="currentType === 'submissions'"
        w-full
      >
        <SubmissionsTable
          w-full
          :rank="rank"
          :submissions="team.submissions"
          :page-size="8"
          :remove-border="true"
        />
      </div>
    </div>
  </Modal>
</template>
