import type { ResolverVue } from "@xcpcio/core";
import type { Ref } from "vue";

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { nextTick, onMounted, ref, watch } from "vue";

gsap.registerPlugin(ScrollToPlugin);

// The AC result is revealed before the row starts moving, and a large rank
// jump only animates until the row has left the viewport before snapping to
// its final position. Otherwise a team jumping dozens of places crosses the
// viewport in a few frames and the movement is impossible to follow.
const REVEAL_HOLD_MS = 400;
const MIN_ROLL_MS = 700;
const MAX_ROLL_MS = 2200;
const ROLL_SPEED_PX_PER_MS = 0.4;
const FLY_OUT_MARGIN_PX = 24;

export function useResolverPlayback(resolver: Ref<ResolverVue>) {
  const resolverRef = ref<HTMLElement | null>(null);
  const currentRowRef = ref<HTMLElement | null>(null);
  // Keeps the rank numbers of the old order visible while the AC result is
  // revealed. They update together with the roll, not before it starts.
  const displayedRanks = ref<Map<string, number> | null>(null);

  const startFirstScroll = ref(false);
  const finishedFirstScroll = ref(false);

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

  function handleNextKey() {
    if (!finishedFirstScroll.value) {
      startFirstScroll.value = true;
      return;
    }

    handleNext();
  }

  function handleRewind() {
    startOperationAnimation(() => resolver.value.rewind());
  }

  onMounted(() => {
    watch(() => startFirstScroll.value, () => {
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

  return {
    resolverRef,
    currentRowRef,
    displayedRanks,
    handleNextKey,
    handleRewind,
    stopInitialScroll,
    scrollActiveRowIntoPlace,
  };
}
