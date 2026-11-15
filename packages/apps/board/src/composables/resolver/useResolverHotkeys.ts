import type { Ref } from "vue";

import { onKeyStroke, onKeyUp } from "@vueuse/core";

export interface ResolverHotkeysOptions {
  loaded: Ref<boolean>;
  isLessMode: Ref<boolean>;
  isHelpVisible: Ref<boolean>;
  toggleHelp: () => void;
  next: () => void;
  rewind: () => void;
  resetRowHistory: () => void;
  stepRowForward: () => void;
  stepRowBackward: () => void;
  stepHalfPageForward: () => void;
  stepHalfPageBackward: () => void;
  stepPageForward: () => void;
  stepPageBackward: () => void;
  stepToTop: () => void;
  stepToBottom: () => void;
}

export function useResolverHotkeys(options: ResolverHotkeysOptions) {
  const {
    loaded,
    isLessMode,
    isHelpVisible,
    toggleHelp,
    next,
    rewind,
    resetRowHistory,
    stepRowForward,
    stepRowBackward,
    stepHalfPageForward,
    stepHalfPageBackward,
    stepPageForward,
    stepPageBackward,
    stepToTop,
    stepToBottom,
  } = options;

  onKeyStroke([" "], (e) => {
    e.preventDefault();
  });

  onKeyUp(["n", " "], () => {
    if (isHelpVisible.value) {
      return;
    }

    next();
  }, { dedupe: true });

  onKeyUp(["r"], () => {
    if (!isHelpVisible.value) {
      resetRowHistory();
      rewind();
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
    if (loaded.value) {
      toggleHelp();
    }
  });

  onKeyUp(["?", "/"], (e) => {
    if (loaded.value && (e.key === "?" || (e.key === "/" && e.shiftKey))) {
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
}
