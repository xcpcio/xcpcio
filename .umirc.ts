import { defineConfig } from "umi";
import __CONFIG__ from "./config";

export default defineConfig({
  title: false,
  metas: __CONFIG__.metas,
  favicon: __CONFIG__.favicon,
  analytics: __CONFIG__.analytics,
  nodeModulesTransform: {
    type: "none",
  },
  hash: true,
  routes: [
    {
      path: "/",
      component: "@/pages/index",
      exact: true,
    },
    {
      path: "/",
      component: "@/pages/board/board",
      exact: false,
    },
  ],
  proxy: __CONFIG__.proxy,
  publicPath: __CONFIG__.publicPath,
});
