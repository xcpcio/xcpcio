import type { DefaultTheme } from "vitepress";
import { defineAdditionalConfig } from "vitepress";
import { version } from "../package.json";

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: "Getting Started", link: "/guide/" },
  { text: "Leaderboard Integration", link: "/guide/board" },
  { text: "Data Format", link: "/guide/data-format" },
];

const Nav: DefaultTheme.NavItem[] = [
  {
    text: "Guide",
    items: [
      {
        text: "Guide",
        items: Guides,
      },
    ],
    activeMatch: "^/guide/",
  },
  { text: "Board", link: "https://board.xcpcio.com" },
  {
    text: `v${version}`,
    items: [
      {
        text: "Release Notes",
        link: "https://github.com/xcpcio/xcpcio/releases",
      },
    ],
  },
];

const SidebarGuide: DefaultTheme.SidebarItem[] = [
  {
    text: "Guides",
    items: Guides,
  },
];

export default defineAdditionalConfig({
  themeConfig: {
    nav: Nav,

    sidebar: {
      "/guide/": SidebarGuide,
    },

    editLink: {
      pattern: "https://github.com/xcpcio/xcpcio/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2020-PRESENT <a href='https://github.com/Dup4' target='_blank'>Dup4</a> <a href='https://beian.miit.gov.cn/' target='_blank'>浙ICP备20011170号</a>",
    },
  },
});
