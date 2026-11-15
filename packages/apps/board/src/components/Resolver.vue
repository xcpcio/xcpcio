<script setup lang="ts">
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams, Lang } from "@xcpcio/types";
import { onKeyUp } from "@vueuse/core";
import { createContest, createSubmissions, createTeams, ResolverVue } from "@xcpcio/core";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const props = defineProps<{
  dataSourceUrl: string;
}>();

gsap.registerPlugin(ScrollToPlugin);

const title = useTitle(RESOLVER_TITLE_SUFFIX);
const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const firstLoaded = ref(false);
const startFirstScroll = ref(false);
const finishedFirstScroll = ref(false);
const isLessMode = ref(false);
const isHelpVisible = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);
const resolver = ref({} as ResolverVue);

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

onKeyStroke([" "], (e) => {
  e.preventDefault();
});

onKeyUp(["n", " "], () => {
  if (isHelpVisible.value) {
    return;
  }

  if (!finishedFirstScroll.value) {
    startFirstScroll.value = true;
    return;
  }

  handleNext();
}, { dedupe: true });

onKeyUp(["r"], () => {
  if (!isHelpVisible.value) {
    handleRewind();
  }
}, { dedupe: true });

onKeyUp(["e"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepRowForward();
  }
});

onKeyUp(["y"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepRowBackward();
  }
});

onKeyUp(["d"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepHalfPageForward();
  }
});

onKeyUp(["u"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepHalfPageBackward();
  }
});

onKeyUp(["b"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepPageBackward();
  }
});

onKeyUp(["f"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepPageForward();
  }
});

onKeyUp(["g"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepToTop();
  }
});

onKeyUp(["G"], () => {
  if (isLessMode.value && !isHelpVisible.value) {
    stepToBottom();
  }
});

onKeyUp(["h"], () => {
  if (firstLoaded.value) {
    toggleHelp();
  }
});

onKeyUp(["?", "/"], (e) => {
  if (firstLoaded.value && (e.key === "?" || (e.key === "/" && e.shiftKey))) {
    toggleHelp();
  }
});

onKeyUp(["l"], () => {
  isLessMode.value = !isLessMode.value;

  if (!isLessMode.value) {
    isHelpVisible.value = false;
  }
});

onKeyUp(["q"], () => {
  if (isHelpVisible.value) {
    isHelpVisible.value = false;
    return;
  }

  isLessMode.value = false;
});

onKeyUp(["Escape"], () => {
  if (isHelpVisible.value) {
    isHelpVisible.value = false;
    return;
  }

  isLessMode.value = false;
});

const resolverRef = ref<HTMLElement | null>(null);
const currentRowRef = ref<HTMLElement | null>(null);
// Keeps the rank numbers of the old order visible while the AC result is
// revealed. They update together with the roll, not before it starts.
const displayedRanks = ref<Map<string, number> | null>(null);

interface RowCheckpoint {
  currentIndex: number;
  currentOpIndex: number;
}

// Row-step history for y. Each entry is the state before one row step (e/f).
const rowHistory: RowCheckpoint[] = [];

// The AC result is revealed before the row starts moving, and a large rank
// jump only animates until the row has left the viewport before snapping to
// its final position. Otherwise a team jumping dozens of places crosses the
// viewport in a few frames and the movement is impossible to follow.
const REVEAL_HOLD_MS = 400;
const MIN_ROLL_MS = 700;
const MAX_ROLL_MS = 2200;
const ROLL_SPEED_PX_PER_MS = 0.4;
const FLY_OUT_MARGIN_PX = 24;

let scrollTween: gsap.core.Tween | null = null;
let initialScrollTween: gsap.core.Tween | null = null;

function stopInitialScroll() {
  if (finishedFirstScroll.value) {
    return;
  }

  initialScrollTween?.kill();
  initialScrollTween = null;
  finishedFirstScroll.value = true;
}

function getRowElements(): HTMLElement[] {
  return Array.from(resolverRef.value?.querySelectorAll<HTMLElement>("[data-team-id]") ?? []);
}

function captureRowTops(): Map<string, number> {
  const tops = new Map<string, number>();

  getRowElements().forEach((el) => {
    if (el.dataset.teamId) {
      tops.set(el.dataset.teamId, el.getBoundingClientRect().top);
    }
  });

  return tops;
}

function scrollActiveRowIntoPlace(duration = 3) {
  if (!finishedFirstScroll.value) {
    return;
  }

  const container = resolverRef.value;
  const currentRow = currentRowRef.value;
  if (!container || !currentRow) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const rowRect = currentRow.getBoundingClientRect();

  // Keep the active row two rows above the bottom edge so the next rows that
  // will be revealed stay visible. The list has matching bottom padding, so
  // even the last rows can reach this position; near the top the scroll is
  // clamped at 0.
  const targetPosition = containerRect.height - 3 * rowRect.height;
  const currentPosition = rowRect.top - containerRect.top;
  const scrollDistance = currentPosition - targetPosition;

  if (Math.abs(scrollDistance) < 1) {
    return;
  }

  scrollTween?.kill();
  scrollTween = gsap.to(container, {
    duration,
    ease: "power1.inOut",
    scrollTop: `+=${scrollDistance}`,
  });
}

function finishRowAnimation(elements: HTMLElement[] = []) {
  elements.forEach(el => gsap.set(el, { clearProps: "transform" }));
  displayedRanks.value = null;
  resolver.value.problemFlashingEnded = true;
  resolver.value.duringAnimation = false;
  scrollActiveRowIntoPlace();
}

function animateRowReorder(tops: Map<string, number>) {
  scrollTween?.kill();
  scrollTween = null;

  const container = resolverRef.value;
  if (!container || tops.size === 0) {
    finishRowAnimation([]);
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const rowElements = getRowElements();
  const rowHeight = rowElements[0]?.getBoundingClientRect().height ?? 96;

  const moves = rowElements.flatMap((el) => {
    const teamId = el.dataset.teamId;
    if (!teamId) {
      return [];
    }

    const oldTop = tops.get(teamId);
    if (oldTop === undefined) {
      return [];
    }

    const newTop = el.getBoundingClientRect().top;
    if (Math.abs(oldTop - newTop) < 1) {
      return [];
    }

    // Rows that remain outside the viewport at both ends do not need animating.
    const aboveViewport = (top: number) => top < containerRect.top - rowHeight;
    const belowViewport = (top: number) => top > containerRect.bottom + rowHeight;
    if ((aboveViewport(oldTop) && aboveViewport(newTop)) || (belowViewport(oldTop) && belowViewport(newTop))) {
      return [];
    }

    // Clamp start and end to just outside the viewport, so a row that starts or
    // ends far outside only travels the visible part of its path. This works for
    // both the upward reveal and the downward rewind.
    const clampTop = (top: number) => {
      if (aboveViewport(top)) {
        return containerRect.top - rowHeight - FLY_OUT_MARGIN_PX;
      }
      if (belowViewport(top)) {
        return containerRect.bottom + rowHeight + FLY_OUT_MARGIN_PX;
      }
      return top;
    };

    const startTop = clampTop(oldTop);
    const endTop = clampTop(newTop);
    const from = startTop - newTop;
    const to = endTop - newTop;
    const distance = Math.abs(to - from);

    if (distance < 1) {
      return [];
    }

    return [{ el, from, to, distance }];
  });

  if (moves.length === 0) {
    window.setTimeout(finishRowAnimation, REVEAL_HOLD_MS);
    return;
  }

  const maxDistance = Math.max(...moves.map(move => move.distance));
  const rollDuration = Math.min(
    MAX_ROLL_MS,
    Math.max(MIN_ROLL_MS, maxDistance / ROLL_SPEED_PX_PER_MS),
  ) / 1000;

  moves.forEach(({ el, from }) => gsap.set(el, { y: from }));

  const timeline = gsap.timeline({
    delay: REVEAL_HOLD_MS / 1000,
    onStart: () => {
      resolver.value.problemFlashingEnded = true;
      displayedRanks.value = null;
    },
    onComplete: () => finishRowAnimation(moves.map(move => move.el)),
  });

  moves.forEach(({ el, to }) => {
    timeline.to(el, {
      y: to,
      duration: rollDuration,
      ease: "power1.inOut",
    }, 0);
  });
}

function startOperationAnimation(run: () => void) {
  if (resolver.value.duringAnimation) {
    return;
  }

  const opIndexBefore = resolver.value.currentOpIndex;

  const ranksBefore = new Map(resolver.value.teams.map(team => [team.id, team.rank]));
  const tops = captureRowTops();

  run();

  if (resolver.value.currentOpIndex === opIndexBefore) {
    return;
  }

  displayedRanks.value = ranksBefore;
  scrollTween?.kill();
  scrollTween = null;

  resolver.value.duringAnimation = true;
  resolver.value.problemFlashingEnded = false;

  void nextTick(() => animateRowReorder(tops));
}

function handleNext() {
  startOperationAnimation(() => resolver.value.next());
}

function handleRewind() {
  rowHistory.length = 0;
  startOperationAnimation(() => resolver.value.rewind());
}

function advanceOneRow(): boolean {
  if (!firstLoaded.value || resolver.value.duringAnimation) {
    return false;
  }

  stopInitialScroll();

  if (resolver.value.currentIndex <= 0) {
    return false;
  }

  const checkpoint: RowCheckpoint = {
    currentIndex: resolver.value.currentIndex,
    currentOpIndex: resolver.value.currentOpIndex,
  };
  const targetIndex = resolver.value.currentIndex - 1;
  let guard = resolver.value.operations.length + 2;

  // Apply every submission that would be revealed before the row moves up,
  // without playing their animations.
  while (resolver.value.currentIndex > targetIndex && guard-- > 0) {
    const indexBefore = resolver.value.currentIndex;
    const opBefore = resolver.value.currentOpIndex;

    resolver.value.next();

    if (resolver.value.currentIndex === indexBefore && resolver.value.currentOpIndex === opBefore) {
      break;
    }
  }

  if (
    resolver.value.currentIndex === checkpoint.currentIndex
    && resolver.value.currentOpIndex === checkpoint.currentOpIndex
  ) {
    return false;
  }

  rowHistory.push(checkpoint);
  return true;
}

function retreatOneRow(): boolean {
  if (!firstLoaded.value || resolver.value.duringAnimation) {
    return false;
  }

  stopInitialScroll();

  const checkpoint = rowHistory.pop();
  if (!checkpoint) {
    return false;
  }

  let guard = resolver.value.operations.length + 2;
  while (resolver.value.currentOpIndex > checkpoint.currentOpIndex && guard-- > 0) {
    resolver.value.rewind();
  }

  resolver.value.currentIndex = checkpoint.currentIndex;
  return true;
}

function getRowsPerScreen(): number {
  const container = resolverRef.value;
  const row = getRowElements()[0];

  if (!container || !row) {
    return 10;
  }

  return Math.max(1, Math.floor(container.clientHeight / row.getBoundingClientRect().height));
}

function stepRowsForward(count: number) {
  let moved = false;

  for (let i = 0; i < count; i++) {
    if (!advanceOneRow()) {
      break;
    }
    moved = true;
  }

  if (moved) {
    void nextTick(() => scrollActiveRowIntoPlace(0.3));
  }
}

function stepRowsBackward(count: number) {
  let moved = false;

  for (let i = 0; i < count; i++) {
    if (!retreatOneRow()) {
      break;
    }
    moved = true;
  }

  if (moved) {
    void nextTick(() => scrollActiveRowIntoPlace(0.3));
  }
}

function getHalfPageRows() {
  return Math.max(1, Math.floor(getRowsPerScreen() / 2));
}

function stepRowForward() {
  stepRowsForward(1);
}

function stepRowBackward() {
  stepRowsBackward(1);
}

function stepHalfPageForward() {
  stepRowsForward(getHalfPageRows());
}

function stepHalfPageBackward() {
  stepRowsBackward(getHalfPageRows());
}

function stepPageForward() {
  stepRowsForward(getRowsPerScreen());
}

function stepPageBackward() {
  stepRowsBackward(getRowsPerScreen());
}

function stepToTop() {
  if (!firstLoaded.value || resolver.value.duringAnimation) {
    return;
  }

  stopInitialScroll();

  const checkpoint: RowCheckpoint = {
    currentIndex: resolver.value.currentIndex,
    currentOpIndex: resolver.value.currentOpIndex,
  };
  let guard = resolver.value.operations.length + resolver.value.maxIndex + 4;

  while (guard-- > 0) {
    if (resolver.value.currentOpIndex > resolver.value.maxOpIndex && resolver.value.currentIndex === 0) {
      break;
    }

    const indexBefore = resolver.value.currentIndex;
    const opBefore = resolver.value.currentOpIndex;

    resolver.value.next();

    if (resolver.value.currentIndex === indexBefore && resolver.value.currentOpIndex === opBefore) {
      break;
    }
  }

  if (
    resolver.value.currentIndex !== checkpoint.currentIndex
    || resolver.value.currentOpIndex !== checkpoint.currentOpIndex
  ) {
    rowHistory.push(checkpoint);
  }

  void nextTick(() => scrollActiveRowIntoPlace(0.3));
}

function stepToBottom() {
  if (!firstLoaded.value || resolver.value.duringAnimation) {
    return;
  }

  stopInitialScroll();

  const startIndex = resolver.value.currentIndex;
  const startOpIndex = resolver.value.currentOpIndex;
  let guard = resolver.value.operations.length + 4;

  while (resolver.value.currentOpIndex > 0 && guard-- > 0) {
    resolver.value.rewind();
  }

  resolver.value.currentIndex = resolver.value.maxIndex;
  rowHistory.length = 0;

  if (startIndex !== resolver.value.currentIndex || startOpIndex !== resolver.value.currentOpIndex) {
    void nextTick(() => scrollActiveRowIntoPlace(0.3));
  }
}

function toggleHelp() {
  isHelpVisible.value = !isHelpVisible.value;
}

onMounted(() => {
  watch(() => startFirstScroll.value, async () => {
    if (finishedFirstScroll.value) {
      return;
    }

    if (!startFirstScroll.value) {
      return;
    }

    if (resolverRef.value) {
      const scrollHeight = resolverRef.value.scrollHeight;
      const clientHeight = resolverRef.value.clientHeight;

      initialScrollTween = gsap.to(resolverRef.value, {
        duration: Math.round(resolver.value.teams.length * 0.2),
        scrollTop: scrollHeight - clientHeight,
        ease: "power1.inOut",
        onComplete: () => {
          initialScrollTween = null;
          finishedFirstScroll.value = true;
        },
      });
    }
  }, { immediate: true });

  watch(() => resolver.value.currentIndex, () => {
    scrollActiveRowIntoPlace();
  }, { flush: "post" });
});
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
          flex flex-col justify-between
          font-mono
          w-screen h-screen
          overflow-hidden
        >
          <div
            ref="resolverRef"
            h-full
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

    <div
      v-if="firstLoaded && isLessMode"
      class="pointer-events-none fixed right-4 top-4 z-[1000] rounded bg-black/60 px-3 py-1 font-mono text-sm text-gray-200"
    >
      LESS MODE · e/y · d/u · f/b · g/G · ? help · q exit
    </div>

    <div
      v-if="firstLoaded && isHelpVisible"
      class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 font-mono"
      @click.self="isHelpVisible = false"
    >
      <div class="mx-4 min-w-[28rem] max-w-[90vw] rounded-lg bg-[#1b1d24] px-8 py-6 text-sm text-gray-200 shadow-xl">
        <div class="mb-4 text-lg font-bold">
          Resolver Hotkeys
        </div>

        <div class="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2">
          <span class="text-gray-400">n / Space</span>
          <span>Next submission / start the initial scroll</span>

          <span class="text-gray-400">r</span>
          <span>Rewind the previous submission</span>

          <span class="text-gray-400">l</span>
          <span>Toggle less mode</span>

          <span class="text-gray-400">q / Esc</span>
          <span>Exit less mode (or close this help)</span>

          <span class="text-gray-400">e / y</span>
          <span>One row up / down</span>

          <span class="text-gray-400">d / u</span>
          <span>Half screen up / down</span>

          <span class="text-gray-400">f / b</span>
          <span>One screen up / down</span>

          <span class="text-gray-400">g / G</span>
          <span>Go to top / bottom</span>

          <span class="text-gray-400">h / ?</span>
          <span>Toggle this help</span>
        </div>

        <div class="mt-4 text-xs text-gray-500">
          Navigation keys (e/y, d/u, f/b, g/G) require less mode.
          <br>
          up = forward (apply/skip submissions) · down = back (undo)
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
