import { useWindowScroll } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";

export const isBoardMenuButtonVisible = ref(true);

/**
 * Hide the floating board menu button while the user scrolls down, and bring it
 * back when they scroll up or return to the top. The standings table uses the
 * same state to move its sticky header below the button while it is visible.
 */
export function useBoardMenuButtonAutoHide(shouldAutoHide: () => boolean = () => true) {
  const { y } = useWindowScroll();

  watch(y, (current, previous) => {
    if (!shouldAutoHide()) {
      isBoardMenuButtonVisible.value = true;
      return;
    }

    if (current <= 8) {
      isBoardMenuButtonVisible.value = true;
      return;
    }

    const delta = current - previous;

    if (delta > 6) {
      isBoardMenuButtonVisible.value = false;
    } else if (delta < -6) {
      isBoardMenuButtonVisible.value = true;
    }
  });

  onMounted(() => {
    isBoardMenuButtonVisible.value = true;
  });

  return {
    isBoardMenuButtonVisible,
  };
}
