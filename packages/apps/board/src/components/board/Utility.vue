<script  setup lang="ts">
// const props = defineProps<{
//   rank: Rank,
// }>();

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const resolverUrl = computed(() => {
  return `https://resolver.xcpcio.com/resolver?xcpcio-data-source=${route.path}`;
});

function goBalloon() {
  router.push(`/balloon/?data-source=${route.path}`);
}

function goCountdown() {
  router.push(`/countdown/?data-source=${route.path}`);
}
</script>

<template>
  <div
    w-full
    flex mt-4 gap-4
  >
    <button
      btn
      title="Balloon"
      @click="goBalloon"
    >
      {{ t('type_menu.balloon') }}
    </button>

    <button
      btn
      title="Submissions"
      disabled="true"
    >
      {{ t('type_menu.submissions') }}
    </button>
  </div>

  <div
    w-full
    flex mt-4 gap-4
  >
    <a
      btn
      :href="resolverUrl"
      target="_blank"
      title="Resolver"
    >
      {{ t("type_menu.resolver") }}
    </a>

    <button
      btn
      title="Countdown"
      @click="goCountdown"
    >
      {{ t('type_menu.countdown') }}
    </button>
  </div>
</template>
