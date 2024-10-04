<script  setup lang="ts">
const { t } = useI18n();

const route = useRoute();
const router = useRouter();

function goResolver() {
  router.push(`/resolver/?data-source=${route.path}`);
}

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
    <button
      btn
      title="Resolver"
      @click="goResolver"
    >
      {{ t('type_menu.resolver') }}
    </button>

    <button
      btn
      title="Countdown"
      @click="goCountdown"
    >
      {{ t('type_menu.countdown') }}
    </button>
  </div>
</template>
