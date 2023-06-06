import { defineConfig } from "umi";

export default defineConfig({
  title: false,
  metas: [
    {
      name: "keywords",
      content: "icpc, ccpc, board, rank, standings",
    },
    {
      name: "description",
      content: "XCPCIO-Board 主要收录 *CPC 系列竞赛的榜单。",
    },
  ],
  favicon: "/favicon.ico",
  publicPath: "/",
  runtimePublicPath: true,
  hash: true,
  nodeModulesTransform: {
    type: "none",
  },
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
  proxy: {
    "/data": {
      target: "http://127.0.0.1:8080",
      changeOrigin: true,
    },
  },
});
