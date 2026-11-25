import {
  getRoutingMode,
  isQueryRoutingMode,
  resolveBoardRoute,
  resolveComponentRoute,
} from "@board/composables/routing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  delete window.RUNTIME_CONFIG;
});

afterEach(() => {
  window.localStorage.clear();
  delete window.RUNTIME_CONFIG;
});

describe("routing mode", () => {
  it("defaults to path routing", () => {
    expect(getRoutingMode()).toBe("path");
    expect(isQueryRoutingMode()).toBe(false);
    expect(resolveBoardRoute("/icpc/51st/nanjing")).toBe("/icpc/51st/nanjing");
  });

  it("opens boards through /board with a data source in query mode", () => {
    window.RUNTIME_CONFIG = { routingMode: "query" };

    expect(getRoutingMode()).toBe("query");
    expect(isQueryRoutingMode()).toBe(true);
    expect(resolveBoardRoute("/icpc/51st/nanjing")).toEqual({
      path: "/board/",
      query: { "data-source": "/icpc/51st/nanjing" },
    });
  });

  it("reads the routing mode from the stored config", () => {
    window.localStorage.setItem(
      "xcpcio-runtime-config",
      JSON.stringify({ routingMode: "query" }),
    );

    expect(getRoutingMode()).toBe("query");
  });

  it("resolves component routes with the given data source", () => {
    expect(resolveComponentRoute("resolver", "/icpc/51st/nanjing")).toEqual({
      path: "/resolver/",
      query: { "data-source": "/icpc/51st/nanjing" },
    });
  });
});
