<script  setup lang="ts">
// const props = defineProps<{
//   rank: Rank,
// }>();

const { t } = useI18n();

const route = useRoute();

const resolverUrl = computed(() => {
  return `https://resolver.xcpcio.com/resolver?xcpcio-data-source=${route.path}`;
});
</script>

<template>
  <div
    flex w-full mt-4
  >
    <a
      btn
      :href="resolverUrl"
      target="_blank"
      title="Resolver"
    >
      {{ t("type_menu.resolver") }}
    </a>
  </div>
</template>
