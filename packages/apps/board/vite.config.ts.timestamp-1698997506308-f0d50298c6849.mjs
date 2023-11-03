// vite.config.ts
import path from "node:path";
import { defineConfig } from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite@4.4.9_@types+node@18.17.6_less@4.2.0/node_modules/vite/dist/node/index.js";
import Vue from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/@vitejs+plugin-vue@4.2.3_vite@4.4.9_vue@3.3.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Pages from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-plugin-pages@0.31.0_vite@4.4.9/node_modules/vite-plugin-pages/dist/index.mjs";
import generateSitemap from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-ssg-sitemap@0.5.1/node_modules/vite-ssg-sitemap/dist/index.js";
import Layouts from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-plugin-vue-layouts@0.8.0_vite@4.4.9_vue-router@4.2.4_vue@3.3.4/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import Components from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/unplugin-vue-components@0.25.1_rollup@2.79.1_vue@3.3.4/node_modules/unplugin-vue-components/dist/vite.mjs";
import AutoImport from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/unplugin-auto-import@0.16.6_@vueuse+core@10.3.0_rollup@2.79.1/node_modules/unplugin-auto-import/dist/vite.js";
import Markdown from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-plugin-vue-markdown@0.23.8_rollup@2.79.1_vite@4.4.9/node_modules/vite-plugin-vue-markdown/dist/index.mjs";
import { VitePWA } from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-plugin-pwa@0.16.4_vite@4.4.9_workbox-build@7.0.0_workbox-window@7.0.0/node_modules/vite-plugin-pwa/dist/index.js";
import VueI18n from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/@intlify+unplugin-vue-i18n@0.12.2_rollup@2.79.1_vue-i18n@9.2.2/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import VueDevTools from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-plugin-vue-devtools@0.5.1_@types+node@18.17.6_nprogress@0.2.0_pug@3.0.2_rollup@2.79.1_vite@4.4.9_vue@3.3.4/node_modules/vite-plugin-vue-devtools/dist/index.mjs";
import LinkAttributes from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/markdown-it-link-attributes@4.0.1/node_modules/markdown-it-link-attributes/index.js";
import Unocss from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/unocss@0.53.6_postcss@8.4.25_rollup@2.79.1_vite@4.4.9/node_modules/unocss/dist/vite.mjs";
import Shiki from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/markdown-it-shiki@0.9.0/node_modules/markdown-it-shiki/dist/index.mjs";
import VueMacros from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/unplugin-vue-macros@2.4.6_@vueuse+core@10.3.0_esbuild@0.14.54_rollup@2.79.1_vite@4.4.9_vue@3.3.4/node_modules/unplugin-vue-macros/dist/vite.mjs";
import WebfontDownload from "file:///Users/dup4/Documents/repo/xcpcio/xcpcio/node_modules/.pnpm/vite-plugin-webfont-dl@3.7.6_vite@4.4.9/node_modules/vite-plugin-webfont-dl/dist/index.mjs";

// package.json
var package_default = {
  name: "@xcpcio/board-app",
  type: "module",
  version: "0.30.0",
  description: "XCPCIO Board App",
  author: "Dup4 <lyuzhi.pan@gmail.com>",
  license: "MIT",
  homepage: "https://github.com/xcpcio/xcpcio",
  repository: {
    type: "git",
    url: "git+https://github.com/xcpcio/xcpcio.git"
  },
  bugs: {
    url: "https://github.com/xcpcio/xcpcio/issues"
  },
  keywords: [
    "ICPC",
    "CCPC",
    "Rank",
    "Board",
    "Standings"
  ],
  files: [
    "src",
    "dist",
    "public",
    "./*.{js,ts,json}"
  ],
  engines: {
    node: ">=16"
  },
  scripts: {
    build: "vite build",
    dev: "vite --port 3333",
    lint: "eslint .",
    "lint:fix": "eslint --fix .",
    preview: "vite preview",
    "preview-https": "serve dist",
    start: "npm run preview",
    test: "vitest",
    "test:e2e": "cypress open",
    "test:unit": "vitest",
    typecheck: "vue-tsc --noEmit",
    up: "taze major -I",
    sizecheck: "npx vite-bundle-visualizer"
  },
  dependencies: {
    "@tanstack/vue-query": "^4.32.6",
    "@unhead/vue": "^1.3.3",
    "@unocss/reset": "^0.53.6",
    "@vueuse/components": "^10.3.0",
    "@vueuse/core": "^10.3.0",
    "@vueuse/head": "^1.3.1",
    "@vueuse/router": "^10.3.0",
    "@xcpcio/core": "workspace:*",
    "@xcpcio/types": "workspace:*",
    dayjs: "^1.11.8",
    "file-saver": "^2.0.5",
    "floating-vue": "2.0.0-beta.24",
    flowbite: "^1.8.1",
    highcharts: "^11.1.0",
    "highcharts-vue": "^1.4.3",
    lodash: "^4.17.21",
    nprogress: "^0.2.0",
    pinia: "^2.1.6",
    "sleep-promise": "^9.1.0",
    vue: "^3.3.4",
    "vue-demi": "^0.14.5",
    "vue-i18n": "^9.2.2",
    "vue-router": "^4.2.4",
    "vue-search-select": "^3.1.2",
    "vue-toast-notification": "^3"
  },
  devDependencies: {
    "@antfu/eslint-config": "^0.39.8",
    "@iconify/json": "^2.2.102",
    "@intlify/unplugin-vue-i18n": "^0.12.2",
    "@types/file-saver": "^2.0.5",
    "@types/lodash": "^4.14.195",
    "@types/markdown-it-link-attributes": "^3.0.1",
    "@types/nprogress": "^0.2.0",
    "@unocss/eslint-config": "^0.53.6",
    "@vitejs/plugin-vue": "^4.2.3",
    "@vue-macros/volar": "^0.12.3",
    "@vue/test-utils": "^2.4.1",
    critters: "^0.0.19",
    "cross-env": "^7.0.3",
    cypress: "^12.17.3",
    "cypress-vite": "^1.4.2",
    eslint: "^8.47.0",
    "eslint-plugin-cypress": "^2.14.0",
    "https-localhost": "^4.7.1",
    less: "^4.2.0",
    "markdown-it-link-attributes": "^4.0.1",
    "markdown-it-shiki": "^0.9.0",
    pnpm: "^8.6.12",
    shiki: "^0.14.3",
    taze: "^0.11.2",
    typescript: "^5.1.6",
    unocss: "^0.53.6",
    "unplugin-auto-import": "^0.16.6",
    "unplugin-vue-components": "^0.25.1",
    "unplugin-vue-macros": "^2.4.6",
    vite: "^4.4.9",
    "vite-bundle-visualizer": "^0.8.1",
    "vite-plugin-inspect": "^0.7.38",
    "vite-plugin-pages": "^0.31.0",
    "vite-plugin-pwa": "^0.16.4",
    "vite-plugin-vue-component-preview": "^1.1.6",
    "vite-plugin-vue-devtools": "^0.5.1",
    "vite-plugin-vue-layouts": "^0.8.0",
    "vite-plugin-vue-markdown": "^0.23.8",
    "vite-plugin-webfont-dl": "^3.7.6",
    "vite-ssg": "^0.23.3",
    "vite-ssg-sitemap": "^0.5.1",
    vitest: "^0.33.0",
    "vue-tsc": "^1.8.8",
    "workbox-build": "^7.0.0",
    "workbox-window": "^7.0.0"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/dup4/Documents/repo/xcpcio/xcpcio/packages/apps/board";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__vite_injected_original_dirname, "src")}/`
    }
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.md$/]
        })
      }
    }),
    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ["vue", "md"]
    }),
    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "vue-i18n",
        "@vueuse/head",
        "@vueuse/core"
      ],
      dts: "src/auto-imports.d.ts",
      dirs: [
        "src/composables",
        "src/stores"
      ],
      vueTemplate: true
    }),
    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: "src/components.d.ts"
    }),
    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Unocss(),
    // https://github.com/antfu/vite-plugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: "prose prose-sm m-auto text-left",
      headEnabled: true,
      markdownItSetup(md) {
        md.use(Shiki, {
          theme: {
            light: "vitesse-light",
            dark: "vitesse-dark"
          }
        });
        md.use(LinkAttributes, {
          matcher: (link) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener"
          }
        });
      }
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
            type: "image/png"
          },
          {
            src: "/balloon2-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/balloon2-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    }),
    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(__vite_injected_original_dirname, "locales/**")]
    }),
    // https://github.com/feat-agency/vite-plugin-webfont-dl
    WebfontDownload(),
    // https://github.com/webfansplz/vite-plugin-vue-devtools
    VueDevTools()
  ],
  // https://github.com/vitest-dev/vitest
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom",
    deps: {
      inline: ["@vue", "@vueuse", "vue-demi"]
    }
  },
  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
    crittersOptions: {
      reduceInlineStyles: false
    },
    onFinished() {
      generateSitemap();
    }
  },
  ssr: {
    // TODO: workaround until they support native ESM
    noExternal: ["workbox-window", /vue-i18n/]
  },
  server: {
    host: true,
    proxy: {
      "/data": {
        // target: "https://board.xcpcio.com",
        target: "http://127.0.0.1:8080",
        changeOrigin: true
      }
    }
  },
  experimental: {
    // eslint-disable-next-line unused-imports/no-unused-vars
    renderBuiltUrl(filename, { hostType }) {
      if (process.env.BUILD_MODE === "npm_publish") {
        const tag = package_default.version;
        return `https://cdn.jsdelivr.net/npm/@xcpcio/board-app@${tag}/dist/${filename}`;
      }
      return `__CDN_HOST__/${filename}`;
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2R1cDQvRG9jdW1lbnRzL3JlcG8veGNwY2lvL3hjcGNpby9wYWNrYWdlcy9hcHBzL2JvYXJkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZHVwNC9Eb2N1bWVudHMvcmVwby94Y3BjaW8veGNwY2lvL3BhY2thZ2VzL2FwcHMvYm9hcmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2R1cDQvRG9jdW1lbnRzL3JlcG8veGNwY2lvL3hjcGNpby9wYWNrYWdlcy9hcHBzL2JvYXJkL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSBcIm5vZGU6cGF0aFwiO1xuXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IFZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgUGFnZXMgZnJvbSBcInZpdGUtcGx1Z2luLXBhZ2VzXCI7XG5pbXBvcnQgZ2VuZXJhdGVTaXRlbWFwIGZyb20gXCJ2aXRlLXNzZy1zaXRlbWFwXCI7XG5pbXBvcnQgTGF5b3V0cyBmcm9tIFwidml0ZS1wbHVnaW4tdnVlLWxheW91dHNcIjtcbmltcG9ydCBDb21wb25lbnRzIGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlXCI7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xuaW1wb3J0IE1hcmtkb3duIGZyb20gXCJ2aXRlLXBsdWdpbi12dWUtbWFya2Rvd25cIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5pbXBvcnQgVnVlSTE4biBmcm9tIFwiQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZVwiO1xuaW1wb3J0IFZ1ZURldlRvb2xzIGZyb20gXCJ2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHNcIjtcbmltcG9ydCBMaW5rQXR0cmlidXRlcyBmcm9tIFwibWFya2Rvd24taXQtbGluay1hdHRyaWJ1dGVzXCI7XG5pbXBvcnQgVW5vY3NzIGZyb20gXCJ1bm9jc3Mvdml0ZVwiO1xuaW1wb3J0IFNoaWtpIGZyb20gXCJtYXJrZG93bi1pdC1zaGlraVwiO1xuaW1wb3J0IFZ1ZU1hY3JvcyBmcm9tIFwidW5wbHVnaW4tdnVlLW1hY3Jvcy92aXRlXCI7XG5pbXBvcnQgV2ViZm9udERvd25sb2FkIGZyb20gXCJ2aXRlLXBsdWdpbi13ZWJmb250LWRsXCI7XG5cbmltcG9ydCBwYWNrYWdlSlNPTiBmcm9tIFwiLi9wYWNrYWdlLmpzb25cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIn4vXCI6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpfS9gLFxuICAgIH0sXG4gIH0sXG5cbiAgcGx1Z2luczogW1xuICAgIFZ1ZU1hY3Jvcyh7XG4gICAgICBwbHVnaW5zOiB7XG4gICAgICAgIHZ1ZTogVnVlKHtcbiAgICAgICAgICBpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwubWQkL10sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KSxcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oYW5ub2VydS92aXRlLXBsdWdpbi1wYWdlc1xuICAgIFBhZ2VzKHtcbiAgICAgIGV4dGVuc2lvbnM6IFtcInZ1ZVwiLCBcIm1kXCJdLFxuICAgIH0pLFxuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0pvaG5DYW1waW9uSnIvdml0ZS1wbHVnaW4tdnVlLWxheW91dHNcbiAgICBMYXlvdXRzKCksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tYXV0by1pbXBvcnRcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgXCJ2dWVcIixcbiAgICAgICAgXCJ2dWUtcm91dGVyXCIsXG4gICAgICAgIFwidnVlLWkxOG5cIixcbiAgICAgICAgXCJAdnVldXNlL2hlYWRcIixcbiAgICAgICAgXCJAdnVldXNlL2NvcmVcIixcbiAgICAgIF0sXG4gICAgICBkdHM6IFwic3JjL2F1dG8taW1wb3J0cy5kLnRzXCIsXG4gICAgICBkaXJzOiBbXG4gICAgICAgIFwic3JjL2NvbXBvc2FibGVzXCIsXG4gICAgICAgIFwic3JjL3N0b3Jlc1wiLFxuICAgICAgXSxcbiAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxuICAgIH0pLFxuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICAvLyBhbGxvdyBhdXRvIGxvYWQgbWFya2Rvd24gY29tcG9uZW50cyB1bmRlciBgLi9zcmMvY29tcG9uZW50cy9gXG4gICAgICBleHRlbnNpb25zOiBbXCJ2dWVcIiwgXCJtZFwiXSxcbiAgICAgIC8vIGFsbG93IGF1dG8gaW1wb3J0IGFuZCByZWdpc3RlciBjb21wb25lbnRzIHVzZWQgaW4gbWFya2Rvd25cbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvLCAvXFwubWQkL10sXG4gICAgICBkdHM6IFwic3JjL2NvbXBvbmVudHMuZC50c1wiLFxuICAgIH0pLFxuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3Vub2Nzc1xuICAgIC8vIHNlZSB1bm8uY29uZmlnLnRzIGZvciBjb25maWdcbiAgICBVbm9jc3MoKSxcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlLXBsdWdpbi12dWUtbWFya2Rvd25cbiAgICAvLyBEb24ndCBuZWVkIHRoaXM/IFRyeSB2aXRlc3NlLWxpdGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlc3NlLWxpdGVcbiAgICBNYXJrZG93bih7XG4gICAgICB3cmFwcGVyQ2xhc3NlczogXCJwcm9zZSBwcm9zZS1zbSBtLWF1dG8gdGV4dC1sZWZ0XCIsXG4gICAgICBoZWFkRW5hYmxlZDogdHJ1ZSxcbiAgICAgIG1hcmtkb3duSXRTZXR1cChtZCkge1xuICAgICAgICAvLyBodHRwczovL3ByaXNtanMuY29tL1xuICAgICAgICBtZC51c2UoU2hpa2ksIHtcbiAgICAgICAgICB0aGVtZToge1xuICAgICAgICAgICAgbGlnaHQ6IFwidml0ZXNzZS1saWdodFwiLFxuICAgICAgICAgICAgZGFyazogXCJ2aXRlc3NlLWRhcmtcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbWQudXNlKExpbmtBdHRyaWJ1dGVzLCB7XG4gICAgICAgICAgbWF0Y2hlcjogKGxpbms6IHN0cmluZykgPT4gL15odHRwcz86XFwvXFwvLy50ZXN0KGxpbmspLFxuICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICB0YXJnZXQ6IFwiX2JsYW5rXCIsXG4gICAgICAgICAgICByZWw6IFwibm9vcGVuZXJcIixcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdml0ZS1wbHVnaW4tcHdhXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6IFwiYXV0b1VwZGF0ZVwiLFxuICAgICAgaW5jbHVkZUFzc2V0czogW1wiZmF2aWNvbi5zdmdcIiwgXCJzYWZhcmktcGlubmVkLXRhYi5zdmdcIl0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiBcIkJvYXJkXCIsXG4gICAgICAgIHNob3J0X25hbWU6IFwiQm9hcmRcIixcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiI2ZmZmZmZlwiLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCIvYmFsbG9vbjItMTkyeDE5Mi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiL2JhbGxvb24yLTUxMng1MTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcIi9iYWxsb29uMi01MTJ4NTEyLnBuZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICAgIHB1cnBvc2U6IFwiYW55IG1hc2thYmxlXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaW50bGlmeS9idW5kbGUtdG9vbHMvdHJlZS9tYWluL3BhY2thZ2VzL3VucGx1Z2luLXZ1ZS1pMThuXG4gICAgVnVlSTE4bih7XG4gICAgICBydW50aW1lT25seTogdHJ1ZSxcbiAgICAgIGNvbXBvc2l0aW9uT25seTogdHJ1ZSxcbiAgICAgIGZ1bGxJbnN0YWxsOiB0cnVlLFxuICAgICAgaW5jbHVkZTogW3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwibG9jYWxlcy8qKlwiKV0sXG4gICAgfSksXG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmVhdC1hZ2VuY3kvdml0ZS1wbHVnaW4td2ViZm9udC1kbFxuICAgIFdlYmZvbnREb3dubG9hZCgpLFxuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYmZhbnNwbHovdml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzXG4gICAgVnVlRGV2VG9vbHMoKSxcbiAgXSxcblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdml0ZXN0LWRldi92aXRlc3RcbiAgdGVzdDoge1xuICAgIGluY2x1ZGU6IFtcInRlc3QvKiovKi50ZXN0LnRzXCJdLFxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXG4gICAgZGVwczoge1xuICAgICAgaW5saW5lOiBbXCJAdnVlXCIsIFwiQHZ1ZXVzZVwiLCBcInZ1ZS1kZW1pXCJdLFxuICAgIH0sXG4gIH0sXG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3ZpdGUtc3NnXG4gIHNzZ09wdGlvbnM6IHtcbiAgICBzY3JpcHQ6IFwiYXN5bmNcIixcbiAgICBmb3JtYXR0aW5nOiBcIm1pbmlmeVwiLFxuICAgIGNyaXR0ZXJzT3B0aW9uczoge1xuICAgICAgcmVkdWNlSW5saW5lU3R5bGVzOiBmYWxzZSxcbiAgICB9LFxuICAgIG9uRmluaXNoZWQoKSB7XG4gICAgICBnZW5lcmF0ZVNpdGVtYXAoKTtcbiAgICB9LFxuICB9LFxuXG4gIHNzcjoge1xuICAgIC8vIFRPRE86IHdvcmthcm91bmQgdW50aWwgdGhleSBzdXBwb3J0IG5hdGl2ZSBFU01cbiAgICBub0V4dGVybmFsOiBbXCJ3b3JrYm94LXdpbmRvd1wiLCAvdnVlLWkxOG4vXSxcbiAgfSxcblxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHByb3h5OiB7XG4gICAgICBcIi9kYXRhXCI6IHtcbiAgICAgICAgLy8gdGFyZ2V0OiBcImh0dHBzOi8vYm9hcmQueGNwY2lvLmNvbVwiLFxuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovLzEyNy4wLjAuMTo4MDgwXCIsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICBleHBlcmltZW50YWw6IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW51c2VkLWltcG9ydHMvbm8tdW51c2VkLXZhcnNcbiAgICByZW5kZXJCdWlsdFVybChmaWxlbmFtZTogc3RyaW5nLCB7IGhvc3RUeXBlIH06IHsgaG9zdFR5cGU6IFwianNcIiB8IFwiY3NzXCIgfCBcImh0bWxcIiB9KSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbi9wcmVmZXItZ2xvYmFsL3Byb2Nlc3NcbiAgICAgIGlmIChwcm9jZXNzLmVudi5CVUlMRF9NT0RFID09PSBcIm5wbV9wdWJsaXNoXCIpIHtcbiAgICAgICAgY29uc3QgdGFnID0gcGFja2FnZUpTT04udmVyc2lvbjtcbiAgICAgICAgcmV0dXJuIGBodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL0B4Y3BjaW8vYm9hcmQtYXBwQCR7dGFnfS9kaXN0LyR7ZmlsZW5hbWV9YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGBfX0NETl9IT1NUX18vJHtmaWxlbmFtZX1gO1xuICAgIH0sXG4gIH0sXG59KTtcbiIsICJ7XG4gIFwibmFtZVwiOiBcIkB4Y3BjaW8vYm9hcmQtYXBwXCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcInZlcnNpb25cIjogXCIwLjMwLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlhDUENJTyBCb2FyZCBBcHBcIixcbiAgXCJhdXRob3JcIjogXCJEdXA0IDxseXV6aGkucGFuQGdtYWlsLmNvbT5cIixcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL2dpdGh1Yi5jb20veGNwY2lvL3hjcGNpb1wiLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS94Y3BjaW8veGNwY2lvLmdpdFwiXG4gIH0sXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20veGNwY2lvL3hjcGNpby9pc3N1ZXNcIlxuICB9LFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcIklDUENcIixcbiAgICBcIkNDUENcIixcbiAgICBcIlJhbmtcIixcbiAgICBcIkJvYXJkXCIsXG4gICAgXCJTdGFuZGluZ3NcIlxuICBdLFxuICBcImZpbGVzXCI6IFtcbiAgICBcInNyY1wiLFxuICAgIFwiZGlzdFwiLFxuICAgIFwicHVibGljXCIsXG4gICAgXCIuLyoue2pzLHRzLGpzb259XCJcbiAgXSxcbiAgXCJlbmdpbmVzXCI6IHtcbiAgICBcIm5vZGVcIjogXCI+PTE2XCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZFwiLFxuICAgIFwiZGV2XCI6IFwidml0ZSAtLXBvcnQgMzMzM1wiLFxuICAgIFwibGludFwiOiBcImVzbGludCAuXCIsXG4gICAgXCJsaW50OmZpeFwiOiBcImVzbGludCAtLWZpeCAuXCIsXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXG4gICAgXCJwcmV2aWV3LWh0dHBzXCI6IFwic2VydmUgZGlzdFwiLFxuICAgIFwic3RhcnRcIjogXCJucG0gcnVuIHByZXZpZXdcIixcbiAgICBcInRlc3RcIjogXCJ2aXRlc3RcIixcbiAgICBcInRlc3Q6ZTJlXCI6IFwiY3lwcmVzcyBvcGVuXCIsXG4gICAgXCJ0ZXN0OnVuaXRcIjogXCJ2aXRlc3RcIixcbiAgICBcInR5cGVjaGVja1wiOiBcInZ1ZS10c2MgLS1ub0VtaXRcIixcbiAgICBcInVwXCI6IFwidGF6ZSBtYWpvciAtSVwiLFxuICAgIFwic2l6ZWNoZWNrXCI6IFwibnB4IHZpdGUtYnVuZGxlLXZpc3VhbGl6ZXJcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdGFuc3RhY2svdnVlLXF1ZXJ5XCI6IFwiXjQuMzIuNlwiLFxuICAgIFwiQHVuaGVhZC92dWVcIjogXCJeMS4zLjNcIixcbiAgICBcIkB1bm9jc3MvcmVzZXRcIjogXCJeMC41My42XCIsXG4gICAgXCJAdnVldXNlL2NvbXBvbmVudHNcIjogXCJeMTAuMy4wXCIsXG4gICAgXCJAdnVldXNlL2NvcmVcIjogXCJeMTAuMy4wXCIsXG4gICAgXCJAdnVldXNlL2hlYWRcIjogXCJeMS4zLjFcIixcbiAgICBcIkB2dWV1c2Uvcm91dGVyXCI6IFwiXjEwLjMuMFwiLFxuICAgIFwiQHhjcGNpby9jb3JlXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkB4Y3BjaW8vdHlwZXNcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiZGF5anNcIjogXCJeMS4xMS44XCIsXG4gICAgXCJmaWxlLXNhdmVyXCI6IFwiXjIuMC41XCIsXG4gICAgXCJmbG9hdGluZy12dWVcIjogXCIyLjAuMC1iZXRhLjI0XCIsXG4gICAgXCJmbG93Yml0ZVwiOiBcIl4xLjguMVwiLFxuICAgIFwiaGlnaGNoYXJ0c1wiOiBcIl4xMS4xLjBcIixcbiAgICBcImhpZ2hjaGFydHMtdnVlXCI6IFwiXjEuNC4zXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFwibnByb2dyZXNzXCI6IFwiXjAuMi4wXCIsXG4gICAgXCJwaW5pYVwiOiBcIl4yLjEuNlwiLFxuICAgIFwic2xlZXAtcHJvbWlzZVwiOiBcIl45LjEuMFwiLFxuICAgIFwidnVlXCI6IFwiXjMuMy40XCIsXG4gICAgXCJ2dWUtZGVtaVwiOiBcIl4wLjE0LjVcIixcbiAgICBcInZ1ZS1pMThuXCI6IFwiXjkuMi4yXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuMi40XCIsXG4gICAgXCJ2dWUtc2VhcmNoLXNlbGVjdFwiOiBcIl4zLjEuMlwiLFxuICAgIFwidnVlLXRvYXN0LW5vdGlmaWNhdGlvblwiOiBcIl4zXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGFudGZ1L2VzbGludC1jb25maWdcIjogXCJeMC4zOS44XCIsXG4gICAgXCJAaWNvbmlmeS9qc29uXCI6IFwiXjIuMi4xMDJcIixcbiAgICBcIkBpbnRsaWZ5L3VucGx1Z2luLXZ1ZS1pMThuXCI6IFwiXjAuMTIuMlwiLFxuICAgIFwiQHR5cGVzL2ZpbGUtc2F2ZXJcIjogXCJeMi4wLjVcIixcbiAgICBcIkB0eXBlcy9sb2Rhc2hcIjogXCJeNC4xNC4xOTVcIixcbiAgICBcIkB0eXBlcy9tYXJrZG93bi1pdC1saW5rLWF0dHJpYnV0ZXNcIjogXCJeMy4wLjFcIixcbiAgICBcIkB0eXBlcy9ucHJvZ3Jlc3NcIjogXCJeMC4yLjBcIixcbiAgICBcIkB1bm9jc3MvZXNsaW50LWNvbmZpZ1wiOiBcIl4wLjUzLjZcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl40LjIuM1wiLFxuICAgIFwiQHZ1ZS1tYWNyb3Mvdm9sYXJcIjogXCJeMC4xMi4zXCIsXG4gICAgXCJAdnVlL3Rlc3QtdXRpbHNcIjogXCJeMi40LjFcIixcbiAgICBcImNyaXR0ZXJzXCI6IFwiXjAuMC4xOVwiLFxuICAgIFwiY3Jvc3MtZW52XCI6IFwiXjcuMC4zXCIsXG4gICAgXCJjeXByZXNzXCI6IFwiXjEyLjE3LjNcIixcbiAgICBcImN5cHJlc3Mtdml0ZVwiOiBcIl4xLjQuMlwiLFxuICAgIFwiZXNsaW50XCI6IFwiXjguNDcuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1jeXByZXNzXCI6IFwiXjIuMTQuMFwiLFxuICAgIFwiaHR0cHMtbG9jYWxob3N0XCI6IFwiXjQuNy4xXCIsXG4gICAgXCJsZXNzXCI6IFwiXjQuMi4wXCIsXG4gICAgXCJtYXJrZG93bi1pdC1saW5rLWF0dHJpYnV0ZXNcIjogXCJeNC4wLjFcIixcbiAgICBcIm1hcmtkb3duLWl0LXNoaWtpXCI6IFwiXjAuOS4wXCIsXG4gICAgXCJwbnBtXCI6IFwiXjguNi4xMlwiLFxuICAgIFwic2hpa2lcIjogXCJeMC4xNC4zXCIsXG4gICAgXCJ0YXplXCI6IFwiXjAuMTEuMlwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjEuNlwiLFxuICAgIFwidW5vY3NzXCI6IFwiXjAuNTMuNlwiLFxuICAgIFwidW5wbHVnaW4tYXV0by1pbXBvcnRcIjogXCJeMC4xNi42XCIsXG4gICAgXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50c1wiOiBcIl4wLjI1LjFcIixcbiAgICBcInVucGx1Z2luLXZ1ZS1tYWNyb3NcIjogXCJeMi40LjZcIixcbiAgICBcInZpdGVcIjogXCJeNC40LjlcIixcbiAgICBcInZpdGUtYnVuZGxlLXZpc3VhbGl6ZXJcIjogXCJeMC44LjFcIixcbiAgICBcInZpdGUtcGx1Z2luLWluc3BlY3RcIjogXCJeMC43LjM4XCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1wYWdlc1wiOiBcIl4wLjMxLjBcIixcbiAgICBcInZpdGUtcGx1Z2luLXB3YVwiOiBcIl4wLjE2LjRcIixcbiAgICBcInZpdGUtcGx1Z2luLXZ1ZS1jb21wb25lbnQtcHJldmlld1wiOiBcIl4xLjEuNlwiLFxuICAgIFwidml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzXCI6IFwiXjAuNS4xXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi12dWUtbGF5b3V0c1wiOiBcIl4wLjguMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tdnVlLW1hcmtkb3duXCI6IFwiXjAuMjMuOFwiLFxuICAgIFwidml0ZS1wbHVnaW4td2ViZm9udC1kbFwiOiBcIl4zLjcuNlwiLFxuICAgIFwidml0ZS1zc2dcIjogXCJeMC4yMy4zXCIsXG4gICAgXCJ2aXRlLXNzZy1zaXRlbWFwXCI6IFwiXjAuNS4xXCIsXG4gICAgXCJ2aXRlc3RcIjogXCJeMC4zMy4wXCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwiXjEuOC44XCIsXG4gICAgXCJ3b3JrYm94LWJ1aWxkXCI6IFwiXjcuMC4wXCIsXG4gICAgXCJ3b3JrYm94LXdpbmRvd1wiOiBcIl43LjAuMFwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBc1csT0FBTyxVQUFVO0FBRXZYLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxxQkFBcUI7QUFDNUIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sY0FBYztBQUNyQixTQUFTLGVB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
