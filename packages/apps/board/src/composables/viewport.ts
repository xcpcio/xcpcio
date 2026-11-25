import { watchEffect } from "vue";
import { useIsContestIndexPage } from "./indexPage";

const DEVICE_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";
// The board and the headless resolver/balloon/countdown pages still rely on the
// pre-mobile-adaptation ~980px layout viewport and its scaled desktop layout.
const SCALED_VIEWPORT = "width=980";

/**
 * Keep the viewport in sync with the route. The index pages (root and data
 * sub-directories) use a real mobile layout, while contest boards and the
 * headless pages keep the scaled desktop layout. index.html sets the initial
 * value before the app boots; this updates it on client-side navigation.
 */
export function useViewportMeta() {
  const isContestIndexPage = useIsContestIndexPage();

  watchEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const content = isContestIndexPage.value ? DEVICE_VIEWPORT : SCALED_VIEWPORT;
    let meta = document.querySelector<HTMLMetaElement>("meta[name=viewport]");

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }

    if (meta.content !== content) {
      meta.content = content;
    }
  });
}
