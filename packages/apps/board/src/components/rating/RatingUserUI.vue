<script setup lang="ts">
import type { RatingUser } from "@xcpcio/core";
import { RatingUtility } from "@xcpcio/core";

import "./rating.less";

const props = defineProps<{
  ix: number,
  ratingUser: RatingUser,
}>();

const u = computed(() => props.ratingUser);

const hiddenRatingInfoModal = ref(true);
function onClickRatingInfoModal() {
  hiddenRatingInfoModal.value = false;
}
</script>

<template>
  <tr
    class="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    <td
      class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
    >
      {{ u.organization }}
    </td>
    <td>
      <div
        class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
        cursor-pointer
        :class="RatingUtility.getRatingLevelClass(u.rating)"
        @click="onClickRatingInfoModal"
      >
        {{ u.name }}
      </div>

      <div>
        <RatingInfoModal
          v-if="!hiddenRatingInfoModal"
          v-model:isHidden="hiddenRatingInfoModal"
          :rating-user="u"
        />
      </div>
    </td>
    <td
      class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
    >
      {{ u.members.map(m => m.name.trim()).join(" ") }}
    </td>
    <td
      class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
    >
      <RatingBadge
        :rating="u.rating"
      />
    </td>
    <td
      class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
    >
      <RatingBadge
        :rating="u.maxRating"
      />
    </td>
    <td
      class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
    >
      <RatingBadge
        :rating="u.minRating"
      />
    </td>
  </tr>
</template>
