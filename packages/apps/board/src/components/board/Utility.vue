<script setup lang="ts">
import type { RuntimeComponent } from "@board/types";
import type { Rank } from "@xcpcio/core";

import { resolveComponentRoute } from "@board/composables/routing";
import { getRuntimeConfig } from "@board/composables/runtimeConfig";

const props = defineProps<{
  rank: Rank;
}>();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const component = useQueryForComponent();
const queryDataSource = useQueryForDataSourceUrl();
const dataSource = getRuntimeConfig().dataSource;

function goToComponent(target: RuntimeComponent) {
  if (dataSource) {
    component.value = target;
    return;
  }

  router.push(resolveComponentRoute(target, queryDataSource.value || route.path));
}

function goResolver() {
  goToComponent("resolver");
}

function goBalloon() {
  goToComponent("balloon");
}

function goCountdown() {
  goToComponent("countdown");
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
