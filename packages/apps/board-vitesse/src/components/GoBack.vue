<script setup lang="ts">
const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <div>
    <div
      class="text-sm btn m-3"
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
