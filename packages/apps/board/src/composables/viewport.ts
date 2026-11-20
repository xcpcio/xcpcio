import type { RouteLocationNormalizedLoaded } from "vue-router";
import { getRuntimeConfig } from "@board/composables/runtimeConfig";

const DEVICE_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";
const HEADLESS_VIEWPORT = "width=980";
const HEADLESS_COMPONENTS = new Set(["resolver", "balloon", "countdown"]);
const CONTEST_PATH = /^\/(?:camp|icpc|ccpc|provincial-contest)(?:\/|$)/;

function hasHeadlessPath(path: string): boolean {
  return /\/(?:resolver|balloon|countdown)\/?$/.test(path);
}

function isHeadlessRoute(route: RouteLocationNormalizedLoaded): boolean {
  if (route.meta.layout === "headless" || hasHeadlessPath(route.path)) {
    return true;
  }

  if (!CONTEST_PATH.test(route.path)) {
    return false;
  }

  const runtimeConfig = getRuntimeConfig();
  if (!runtimeConfig.dataSource) {
    return false;
  }

  const queryComponent = route.query.component;
  const component = runtimeConfig.component ?? (typeof queryComponent === "string" ? queryComponent : undefined);

  return component !== undefined && HEADLESS_COMPONENTS.has(component);
}

export function useViewportMeta() {
  const route = useRoute();

  useHead({
    meta: [
      {
        name: "viewport",
        content: () => isHeadlessRoute(route) ? HEADLESS_VIEWPORT : DEVICE_VIEWPORT,
      },
    ],
  });
}
