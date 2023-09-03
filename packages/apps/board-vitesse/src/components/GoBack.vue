<script setup lang="ts">
const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <div>
    <div
      class="text-sm m-3 btn"
      @click="router.back()"
    >
      {{ t("button.back") }}
    </div>

    <RouterLink
      class="m-3 text-sm btn"
      to="/"
    >
      {{ t("button.home") }}
    </RouterLink>
  </div>
</template>
