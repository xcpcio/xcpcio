import { defineConfig } from "vitepress";

const hostname = "https://xcpcio.com/";
const ogUrl = hostname;
const ogImage = `${ogUrl}og.png`;
const title = "XCPCIO";
const description = "The ICPC Series Competition Leaderboard Visualization Engine.";
const googleTagId = "GTM-WHLF55BJ";

export default defineConfig({
  title,
  description,
  titleTemplate: `:title - ${title}`,

  rewrites: {
    "en/:rest*": ":rest*",
  },

  outDir: "./dist",
  lastUpdated: true,
  cleanUrls: true,

  sitemap: {
    hostname,
  },

  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    // ["link", { rel: "alternate icon", href: "/favicon.ico", type: "image/png", sizes: "16x16" }],
    ["meta", { name: "author", content: "Dup4" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { name: "og:title", content: title }],
    ["meta", { name: "og:description", content: description }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["meta", { name: "twitter:url", content: ogUrl }],
    [
      "script",
      {},
      `(function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != "dataLayer" ? "&l=" + l : "";
        j.async = true;
        j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
        f.parentNode.insertBefore(j, f);
      })(window, document, "script", "dataLayer", "${googleTagId}");`,
    ],
  ],

  // TODO: add noscript google tag frame

  locales: {
    root: { label: "English", lang: "en-US", dir: "ltr" },
    zh: { label: "简体中文", lang: "zh-Hans", dir: "ltr" },
  },

  markdown: {
    theme: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
  },

  themeConfig: {
    logo: "/logo.svg",

    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },
  },
});
