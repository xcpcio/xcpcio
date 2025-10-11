<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { useRouteQuery } from "@vueuse/router";

const props = defineProps<{
  rank: Rank;
}>();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const component = useRouteQuery("component", "board", { transform: String });

function goResolver() {
  if (window.DATA_SOURCE) {
    component.value = "resolver";
  } else {
    router.push(`/resolver/?data-source=${route.path}`);
  }
}

function goBalloon() {
  if (window.DATA_SOURCE) {
    component.value = "balloon";
  } else {
    router.push(`/balloon/?data-source=${route.path}`);
  }
}

function goCountdown() {
  if (window.DATA_SOURCE) {
    component.value = "countdown";
  } else {
    router.push(`/countdown/?data-source=${route.path}`);
  }
}
</script>

<template>
  <div
    flex flex-col
  >
    <div>
      <div class="mb-2 text-xl font-bold">
        {{ t('utility.tools') }}
      </div>

      <div class="border-t border-gray-300 pt-4">
        <div
          w-full
          flex gap-4
        >
          <button
            btn
            title="Countdown"
            @click="goCountdown"
          >
            {{ t('type_menu.countdown') }}
          </button>

          <button
            btn
            title="Balloon"
            @click="goBalloon"
          >
            {{ t('type_menu.balloon') }}
          </button>

          <button
            btn
            title="Resolver"
            @click="goResolver"
          >
            {{ t('type_menu.resolver') }}
          </button>

          <button
            btn
            title="Submissions"
            disabled="true"
          >
            {{ t('type_menu.submissions') }}
          </button>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <div class="mb-2 text-xl font-bold">
        {{ t('utility.export') }}
      </div>

      <div class="border-t border-gray-300 pt-4">
        <Export
          :rank="props.rank"
        />
      </div>
    </div>
  </div>
</template>
