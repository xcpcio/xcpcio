<script setup lang="ts">
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams, Lang } from "@xcpcio/types";
import ResolverHelpOverlay from "@board/components/resolver/ResolverHelpOverlay.vue";
import { useResolverHotkeys } from "@board/composables/resolver/useResolverHotkeys";
import { useResolverLessMode } from "@board/composables/resolver/useResolverLessMode";
import { useResolverPlayback } from "@board/composables/resolver/useResolverPlayback";
import { createContest, createSubmissions, createTeams, ResolverVue } from "@xcpcio/core";

const props = defineProps<{
  dataSourceUrl: string;
}>();

const title = useTitle(RESOLVER_TITLE_SUFFIX);
const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const firstLoaded = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);
const resolver = ref({} as ResolverVue);

const hasOrgLogo = computed(() => resolver.value.teams?.some(team => team.organization?.logo) ?? false);

const playback = useResolverPlayback(resolver);
const { resolverRef, currentRowRef, displayedRanks } = playback;

const navigation = useResolverLessMode({
  resolver,
  loaded: firstLoaded,
  resolverRef,
  stopInitialScroll: playback.stopInitialScroll,
  cancelScroll: playback.cancelScroll,
  beginJump: playback.beginJump,
  endJump: playback.endJump,
  scrollToEdge: playback.scrollToEdge,
  scrollToRowIndex: playback.scrollToRowIndex,
});

useResolverHotkeys({
  loaded: firstLoaded,
  isLessMode: navigation.isLessMode,
  isHelpVisible: navigation.isHelpVisible,
  toggleHelp: navigation.toggleHelp,
  next: playback.handleNextKey,
  rewind: playback.handleRewind,
  resetRowHistory: navigation.resetRowHistory,
  stepRowForward: navigation.stepRowForward,
  stepRowBackward: navigation.stepRowBackward,
  stepHalfPageForward: navigation.stepHalfPageForward,
  stepHalfPageBackward: navigation.stepHalfPageBackward,
  stepPageForward: navigation.stepPageForward,
  stepPageBackward: navigation.stepPageBackward,
  stepToTop: navigation.stepToTop,
  stepToBottom: navigation.stepToBottom,
  cancelScroll: playback.cancelScroll,
});

const { isLessMode, isHelpVisible } = navigation;

function reBuildResolver() {
  const newResolver = new ResolverVue(contest.value, teams.value, submissions.value);
  newResolver.buildResolver();
  resolver.value = newResolver;
}

const { data, isError, error } = useQueryBoardData(props.dataSourceUrl, /* queryOnce= */true);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contest.value = createContest(data.value?.contest as IContest);
  title.value = `${contest.value.name.getOrDefault(lang.value)} | ${RESOLVER_TITLE_SUFFIX}`;

  teams.value = createTeams(data.value?.teams as ITeams);
  submissions.value = createSubmissions(data.value?.submissions as ISubmissions, contest.value);

  reBuildResolver();

  firstLoaded.value = true;
}, { immediate: true });
</script>

<template>
  <div
    text-gray-200
    w-screen h-screen
  >
    <div v-if="!firstLoaded">
      <div
        flex flex-col
        justify-center items-center
        w-screen h-screen
        text-xl italic
        class="bg-[#323443]"
      >
        <div>
          {{ t("common.loading") }}...
        </div>

        <div v-if="isError">
          {{ error }}
        </div>
      </div>
    </div>

    <div
      v-else
    >
      <div>
        <div
          class="bg-resolver-bg-1"
          flex flex-col
          font-mono
          w-screen h-screen
          overflow-hidden
        >
          <div
            class="resolver-header shrink-0 border-b border-white/10 bg-resolver-bg-1"
            flex flex-row items-center gap-x-4
            text-sm font-bold text-gray-400
          >
            <div w-20 text-center>
              Rank
            </div>

            <div
              flex flex-1 flex-row items-center gap-x-4
              min-w-0
            >
              <div
                v-if="hasOrgLogo"
                w-20 shrink-0
              />

              <div
                flex flex-1 flex-row items-center justify-between gap-x-4
                min-w-0
              >
                <div shrink-0>
                  Name
                </div>

                <div
                  v-if="isLessMode"
                  class="text-xs font-normal text-gray-500"
                  truncate
                >
                  LESS MODE · e/y · d/u · f/b · g/G · ? help · q exit
                </div>
              </div>
            </div>

            <div
              w-48
              flex flex-row
            >
              <div class="w-1/3 text-center">
                Solved
              </div>
              <div class="w-2/3 text-center">
                Penalty
              </div>
            </div>
          </div>

          <div
            ref="resolverRef"
            class="resolver-scroll"
            flex-1 min-h-0
            overflow-y-auto
          >
            <!-- Two rows of empty space so the last rows can scroll up to the
                 third-from-bottom position. The first row continues the list
                 stripes; the bottom row uses the dark page background so the
                 bottom edge never ends on the lighter stripe. -->
            <ul class="resolver-list pb-24">
              <template
                v-for="(team, index) in resolver.teams"
                :key="team.id"
              >
                <div
                  :ref="(el) => { if (index === resolver.currentIndex) { currentRowRef = el as HTMLElement; } }"
                  :data-team-id="team.id"
                  :class="[team.id === resolver.currentTeamId ? 'z-999' : 'z-0']"
                  position-relative
                >
                  <ResolverTeamRow
                    :index="index"
                    :team="team"
                    :resolver="resolver"
                    :display-rank="displayedRanks?.get(team.id) ?? team.rank"
                  />
                </div>
              </template>
            </ul>
            <div
              class="h-24 bg-resolver-bg-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>

    <ResolverHelpOverlay
      :visible="isHelpVisible"
      @close="isHelpVisible = false"
    />
  </div>
</template>

<style scoped>
/* Row reorders during g/G must not make the browser shift the scroll position. */
.resolver-scroll {
  overflow-anchor: none;
}

/* Keep the row stripes attached to the list, not the rows: when rows reorder
   or slide, the background changes continuously with their position instead of
   flipping instantly with their index. Use the same rem-based row height as
   `h-24` so the stripes also cover the empty padding rows below the last team. */
.resolver-list {
  background-image: repeating-linear-gradient(
    180deg,
    var(--theme-resolver-bg-0) 0,
    var(--theme-resolver-bg-0) 6rem,
    var(--theme-resolver-bg-1) 6rem,
    var(--theme-resolver-bg-1) 12rem
  );
}
</style>
