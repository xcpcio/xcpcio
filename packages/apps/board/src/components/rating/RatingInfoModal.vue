<script setup lang="ts">
import { Chart } from "highcharts-vue";

import type { RatingUser } from "@xcpcio/core";

import "./rating.less";

const props = defineProps<{
  isHidden: boolean,

  ratingUser: RatingUser,
}>();

const emit = defineEmits(["update:isHidden"]);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const ratingUser = computed(() => props.ratingUser);

const headerTitle = computed(() => {
  let res = "";

  if (ratingUser.value.organization.length > 0) {
    res += `${ratingUser.value.organization} - `;
  }

  res += `${ratingUser.value.name}`;

  if (ratingUser.value.members.length > 0) {
    res += ` - ${ratingUser.value.members.map(m => m.name).join(",")}`;
  }

  if (ratingUser.value.coaches.length > 0) {
    res += ` - ${ratingUser.value.coaches.map(c => c.name).join(",")}(coach)`;
  }

  return res;
});
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    width="w-278"
  >
    <template #header>
      <div
        w-full max-w-screen-xl
        mx-auto
        px-4 lg:px-8
      >
        <div
          relative overflow-hidden
          bg-white dark:bg-gray-800
        >
          <div
            flex flex-col items-center justify-between
            md:flex-row
            space-y-3 md:space-y-0
          >
            <div
              flex flex-row
              space-x-3
            >
              <Tooltip>
                <h3
                  text-gray-900 dark:text-white
                  text-2xl
                  font-sans font-semibold italic
                >
                  {{ headerTitle }}
                </h3>

                <template #popper>
                  <div
                    flex flex-col
                    justify-start items-start
                  >
                    <div>
                      TeamID: {{ ratingUser.id }}
                    </div>
                  </div>
                </template>
              </Tooltip>
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
        w-full
      >
        <Chart
          :options="getRatingGraphOptions(ratingUser)"
        />
      </div>
    </div>
  </Modal>
</template>
