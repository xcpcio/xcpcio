import path from "node:path";
import process from "node:process";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import Shiki from "@shikijs/markdown-it";
import { unheadVueComposablesImports } from "@unhead/vue";
import Vue from "@vitejs/plugin-vue";
import getGitRepoInfo from "git-repo-info";
import LinkAttributes from "markdown-it-link-attributes";
import Unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import VueMacros from "unplugin-vue-macros/vite";

import Markdown from "unplugin-vue-markdown/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { VitePWA } from "vite-plugin-pwa";
import VueDevTools from "vite-plugin-vue-devtools";
import Layouts from "vite-plugin-vue-layouts";
import WebfontDownload from "vite-plugin-webfont-dl";
import generateSitemap from "vite-ssg-sitemap";
import { alias } from "../../../alias";
import { homepage, version } from "./package.json";
import "vitest/config";

const gitRepoInfo = getGitRepoInfo();

const proxyConfig = {
  target: process.env.PROXY_TARGET || "https://board.xcpcio.com",
  changeOrigin: true,
};

export default defineConfig({
  resolve: {
    alias,
  },

  define: {
    __APP_VERSION__: JSON.stringify(version),
    __GITHUB_URL__: JSON.stringify("https://github.com/xcpcio/xcpcio"),
    __GITHUB_SHA__: JSON.stringify(gitRepoInfo.abbreviatedSha),
    __XCPCIO_HOME__: JSON.stringify(homepage),
  },

  plugins: [
    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      extensions: [".vue", ".md"],
      dts: "src/typed-router.d.ts",
    }),

    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.md$/],
        }),
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      include: [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        "vue",
        "vue-i18n",
        "@vueuse/core",
        unheadVueComposablesImports,
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          "vue-router/auto": ["useLink"],
        },
      ],
      dts: "src/auto-imports.d.ts",
      dirs: [
        "src/composables",
        "src/stores",
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: "src/components.d.ts",
    }),

    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Unocss(),

    // https://github.com/unplugin/unplugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: "prose prose-sm m-auto text-left",
      headEnabled: true,
      async markdownItSetup(md) {
        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener",
          },
        });
        md.use(await Shiki({
          defaultColor: false,
          themes: {
            light: "vitesse-light",
            dark: "vitesse-dark",
          },
        }));
      },
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "safari-pinned-tab.svg"],
      manifest: {
        name: "Board",
        short_name: "Board",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/balloon2-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/balloon2-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/balloon2-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),

    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(__dirname, "locales/**")],
    }),

    // https://github.com/webfansplz/vite-plugin-vue-devtools
    VueDevTools(),

    // https://github.com/feat-agency/vite-plugin-webfont-dl
    WebfontDownload(),

    // https://github.com/vbenjs/vite-plugin-html
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom",
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
    beastiesOptions: {
      reduceInlineStyles: false,
    },
    onFinished() {
      generateSitemap();
    },
  },

  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ["workbox-window", /vue-i18n/],
  },

  server: {
    host: true,
    proxy: {
      "/data": proxyConfig,
      "/rating-data": proxyConfig,
    },
  },

  experimental: {
    renderBuiltUrl(filename: string, { hostType, type }: { hostId: string; hostType: "js" | "css" | "html"; type: "public" | "asset" }) {
      if (type === "public") {
        return `__CDN_HOST__/${filename}`;
      }
      if (hostType === "js") {
        return {
          runtime: `window.__toAssetUrl(${JSON.stringify(filename)})`,
        };
      }

      return `__CDN_HOST__/${filename}`;
    },
  },
});
