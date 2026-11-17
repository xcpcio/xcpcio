import type { ResolverVue } from "@xcpcio/core";
import type { Ref } from "vue";

import { nextTick, ref } from "vue";

interface RowCheckpoint {
  currentIndex: number;
  currentOpIndex: number;
}

export interface ResolverLessModeOptions {
  resolver: Ref<ResolverVue>;
  loaded: Ref<boolean>;
  resolverRef: Ref<HTMLElement | null>;
  stopInitialScroll: () => void;
  cancelScroll: () => void;
  beginJump: () => void;
  endJump: () => void;
  scrollToEdge: (edge: "top" | "bottom", onComplete: () => void) => void;
  scrollToRowIndex: (index: number, onComplete: () => void) => void;
}

export function useResolverLessMode(options: ResolverLessModeOptions) {
  const {
    resolver,
    loaded,
    resolverRef,
    stopInitialScroll,
    cancelScroll,
    beginJump,
    endJump,
    scrollToEdge,
    scrollToRowIndex,
  } = options;

  const isLessMode = ref(false);
  const isHelpVisible = ref(false);

  // Row-step history for y. Each entry is the state before one row step (e/f).
  const rowHistory: RowCheckpoint[] = [];

  // Row/page steps apply their state after the scroll. Keep the pending apply
  // so rapid key presses still accumulate instead of being dropped.
  let pendingRowStep: (() => void) | null = null;

  function flushPendingRowStep() {
    const apply = pendingRowStep;
    pendingRowStep = null;
    apply?.();
  }

  function resetRowHistory() {
    rowHistory.length = 0;
  }

  function advanceOneRow(): boolean {
    if (!loaded.value || resolver.value.duringAnimation) {
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
    if (!loaded.value || resolver.value.duringAnimation) {
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
    const row = container?.querySelector<HTMLElement>("[data-team-id]");

    if (!container || !row) {
      return 10;
    }

    return Math.max(1, Math.floor(container.clientHeight / row.getBoundingClientRect().height));
  }

  function stepRowsForward(count: number) {
    if (!loaded.value || resolver.value.duringAnimation) {
      return;
    }

    flushPendingRowStep();

    const rows = Math.min(count, resolver.value.currentIndex);
    if (rows <= 0) {
      return;
    }

    const targetIndex = resolver.value.currentIndex - rows;

    cancelScroll();
    stopInitialScroll();

    const apply = () => {
      beginJump();

      for (let i = 0; i < rows; i++) {
        if (!advanceOneRow()) {
          break;
        }
      }

      void nextTick(() => endJump());
    };

    pendingRowStep = apply;
    scrollToRowIndex(targetIndex, () => {
      if (pendingRowStep !== apply) {
        return;
      }

      pendingRowStep = null;
      apply();
    });
  }

  function stepRowsBackward(count: number) {
    if (!loaded.value || resolver.value.duringAnimation) {
      return;
    }

    flushPendingRowStep();

    const rows = Math.min(count, rowHistory.length);
    if (rows <= 0) {
      return;
    }

    const targetIndex = rowHistory[rowHistory.length - rows].currentIndex;

    cancelScroll();
    stopInitialScroll();

    const apply = () => {
      beginJump();

      for (let i = 0; i < rows; i++) {
        if (!retreatOneRow()) {
          break;
        }
      }

      void nextTick(() => endJump());
    };

    pendingRowStep = apply;
    scrollToRowIndex(targetIndex, () => {
      if (pendingRowStep !== apply) {
        return;
      }

      pendingRowStep = null;
      apply();
    });
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
    if (!loaded.value || resolver.value.duringAnimation) {
      return;
    }

    flushPendingRowStep();
    cancelScroll();
    stopInitialScroll();

    const checkpoint: RowCheckpoint = {
      currentIndex: resolver.value.currentIndex,
      currentOpIndex: resolver.value.currentOpIndex,
    };

    // Scroll first, then apply the state at the destination. Replaying the
    // operations reorders the rows, and doing that before the scroll paints a
    // different order at the old position, which looks like a jump.
    scrollToEdge("top", () => {
      beginJump();

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

      void nextTick(() => endJump());
    });
  }

  function stepToBottom() {
    if (!loaded.value || resolver.value.duringAnimation) {
      return;
    }

    flushPendingRowStep();
    cancelScroll();
    stopInitialScroll();

    scrollToEdge("bottom", () => {
      beginJump();

      let guard = resolver.value.operations.length + 4;

      while (resolver.value.currentOpIndex > 0 && guard-- > 0) {
        resolver.value.rewind();
      }

      resolver.value.currentIndex = resolver.value.maxIndex;
      resetRowHistory();

      void nextTick(() => endJump());
    });
  }

  function toggleHelp() {
    isHelpVisible.value = !isHelpVisible.value;
  }

  return {
    isLessMode,
    isHelpVisible,
    toggleHelp,
    resetRowHistory,
    stepRowForward,
    stepRowBackward,
    stepHalfPageForward,
    stepHalfPageBackward,
    stepPageForward,
    stepPageBackward,
    stepToTop,
    stepToBottom,
  };
}
