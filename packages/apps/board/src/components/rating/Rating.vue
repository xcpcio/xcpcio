<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { Rating } from "@xcpcio/core";

const props = defineProps<{
  id: string;
}>();

const id = computed(() => props.id);

function genURL() {
  return `${RATING_DATA_HOST.value}${id.value}/rating.json`;
}
const url = ref(genURL());
const rating = ref({} as Rating);

const { t } = useI18n();
useTitle(RATING_TITLE_SUFFIX);

const {
  error,
  isFetching,
  isFinished,
} = useFetch(url, {
  refetch: true,
  afterFetch: (ctx) => {
    rating.value = Rating.fromJSON(ctx.data);
    useTitle(`${rating.value.name} | ${RATING_TITLE_SUFFIX}`);
    return ctx;
  },
}).get();
</script>

<template>
  <div
    class="sm:w-[1024px] lg:w-screen"
    lg:of-x-hidden
    flex flex-col justify-center items-center
  >
    <div>
      <div
        v-if="isFetching || error"
        mt-4 mb-4
        class="sm:w-[1000px] lg:w-screen"
        flex justify-center items-center
      >
        <div
          v-if="isFetching"
        >
          {{ t("common.loading") }}...
        </div>

        <div
          v-if="error"
        >
          {{ error }}
        </div>
      </div>

      <div
        v-if="isFinished"
        flex flex-col justify-center items-center
      >
        <div
          text-4xl
          font-medium font-serif
        >
          {{ rating.name }}
        </div>

        <div
          mt-4
        >
          <RatingTable
            :rating="rating"
            :remove-border="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
