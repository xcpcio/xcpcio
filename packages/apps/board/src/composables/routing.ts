import type { RuntimeComponent, RuntimeRoutingMode } from "@board/types";
import type { RouteLocationRaw } from "vue-router";
import { getRuntimeConfig } from "./runtimeConfig";

/**
 * `path` deployments (board_server) serve each contest at its own path, e.g.
 * `/icpc/51st/nanjing`. `query` deployments (static hosts such as Vercel) only
 * serve the shell routes, so boards open through `/board/?data-source=...`.
 */
export function getRoutingMode(): RuntimeRoutingMode {
  return getRuntimeConfig().routingMode === "query" ? "query" : "path";
}

export function isQueryRoutingMode(): boolean {
  return getRoutingMode() === "query";
}

export function resolveBoardRoute(boardLink: string): RouteLocationRaw {
  if (!isQueryRoutingMode()) {
    return boardLink;
  }

  return {
    path: "/board/",
    query: { "data-source": boardLink },
  };
}

export function resolveComponentRoute(
  component: RuntimeComponent,
  dataSource: string,
): RouteLocationRaw {
  return {
    path: `/${component}/`,
    query: { "data-source": dataSource },
  };
}
