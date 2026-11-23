import { watchEffect } from "vue";
import { useRoute } from "vue-router";

const DEVICE_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";
// The board and the headless resolver/balloon/countdown pages still rely on the
// pre-mobile-adaptation ~980px layout viewport and its scaled desktop layout.
const SCALED_VIEWPORT = "width=980";

function getViewportContent(path: string) {
  return path === "/" ? DEVICE_VIEWPORT : SCALED_VIEWPORT;
}

/**
 * Keep the viewport in sync with the route. The index page uses a real mobile
 * layout, while contest boards and the headless pages keep the scaled desktop
 * layout. index.html sets the initial value before the app boots; this updates
 * it on client-side navigation.
 */
export function useViewportMeta() {
  const route = useRoute();

  watchEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const content = getViewportContent(route.path);
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
