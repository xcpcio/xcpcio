import type { HeadConfig } from "vitepress";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const hostname = "https://xcpcio.com/";
const ogImage = `${hostname}og.png`;
const title = "XCPCIO";
const description = "The ICPC Series Competition Leaderboard Visualization Engine.";
const googleTagId = "GTM-WHLF55BJ";
const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${hostname}#organization`,
      "name": title,
      "url": hostname,
      "logo": `${hostname}logo.svg`,
      "sameAs": ["https://github.com/xcpcio/xcpcio"],
    },
    {
      "@type": "WebSite",
      "@id": `${hostname}#website`,
      "name": title,
      "url": hostname,
      "description": description,
      "publisher": { "@id": `${hostname}#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${hostname}board/?s={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

function pageUrl(relativePath: string) {
  return `${hostname}${relativePath}`
    .replace(/\/index\.md$/, "/")
    .replace(/\.md$/, "");
}

function getOgTitle(pageTitle: string) {
  if (pageTitle === title) {
    return pageTitle;
  }
  return `${pageTitle} - ${title}`;
}

function getOgDescription(pageDescription: string) {
  if (pageDescription.length > 0) {
    return pageDescription;
  }
  return description;
}

export default defineConfig({
  title,
  description,

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
    ["meta", { name: "author", content: "Dup4" }],
    ["meta", { name: "keywords", content: "ICPC, Rank, Board, Leaderboard, ScoreBoard, Standings" }],
    ["meta", { property: "og:site_name", content: title }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: ogImage }],
    ["meta", { property: "og:image:type", content: "image/png" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: ogImage }],
    ["script", { type: "application/ld+json" }, JSON.stringify(structuredData)],
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
    [
      "noscript",
      {},
      `<iframe
        src="https://www.googletagmanager.com/ns.html?id=${googleTagId}"
        height="0" width="0"
        style="display: none; visibility: hidden"
      ></iframe>`,
    ],
    [
      "script",
      {},
      `
      try {
        var umamiJSUrl = "https://umami.h.dup4.cn/script.js";
        var umamiWebsiteId = "7a1a32ad-1684-4613-a7a4-589ba62f9b57";
        (function () {
          var script = document.createElement("script");
          script.src = umamiJSUrl;
          script.defer = true;
          script.setAttribute("data-website-id", umamiWebsiteId);
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(script, s);
        })();
      } catch (e) {}
      `,
    ],
  ],

  transformHead: ({ pageData }) => {
    const title = getOgTitle(pageData.title);
    const description = getOgDescription(pageData.description);
    const canonicalUrl = pageUrl(pageData.relativePath);
    const isZh = pageData.relativePath.startsWith("zh/");
    const enPath = isZh ? pageData.relativePath.slice(3) : pageData.relativePath;
    const zhPath = isZh ? pageData.relativePath : `zh/${pageData.relativePath}`;
    const hasLocalePair
      = existsSync(resolve(docsRoot, "en", enPath))
        && existsSync(resolve(docsRoot, zhPath));

    const alternates: HeadConfig[] = hasLocalePair
      ? [
          ["link", { rel: "alternate", hreflang: "en", href: pageUrl(enPath) }],
          ["link", { rel: "alternate", hreflang: "zh-Hans", href: pageUrl(zhPath) }],
          ["link", { rel: "alternate", hreflang: "x-default", href: pageUrl(enPath) }],
          ["meta", { property: "og:locale:alternate", content: isZh ? "en_US" : "zh_CN" }],
        ]
      : [];

    return [
      ["meta", { name: "title", content: title }],
      ["meta", { name: "description", content: description }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:locale", content: isZh ? "zh_CN" : "en_US" }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { name: "twitter:url", content: canonicalUrl }],
      ...alternates,
    ];
  },

  // TODO: add text-autospace

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
