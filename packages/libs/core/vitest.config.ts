import { defineConfig } from "vitest/config";
import { alias } from "../../../alias";

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    testTimeout: 30_000,
    name: "core",
    globals: true,
    include: ["test/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
});
