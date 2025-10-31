import type { DefaultTheme } from "vitepress";
import { defineAdditionalConfig } from "vitepress";
import { version } from "../package.json";

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: "Getting Started", link: "/guide/" },
  { text: "Leaderboard Integration", link: "/guide/board" },
  { text: "Data Format", link: "/guide/data-format" },
  { text: "Clics Utility", link: "/guide/clics-utility" },
];

const Sponsors: DefaultTheme.NavItemWithLink[] = [
  { text: "Sponsor Us", link: "/sponsor/" },
  { text: "HZNU Coder", link: "/sponsor/hznu-coder" },
];

const Nav: DefaultTheme.NavItem[] = [
  {
    text: "Guide",
    items: [{ items: Guides }],
    activeMatch: "^/guide/",
  },
  {
    text: "Sponsor",
    items: [{ items: Sponsors }],
    activeMatch: "^/sponsor/",
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

const Sidebar: DefaultTheme.Sidebar = {
  "/guide/": [
    {
      text: "Guides",
      items: Guides,
    },
  ],
  "/sponsor/": [
    {
      text: "Sponsor",
      items: Sponsors,
    },
  ],
};

export default defineAdditionalConfig({
  themeConfig: {
    nav: Nav,
    sidebar: Sidebar,

    editLink: {
      pattern: "https://github.com/xcpcio/xcpcio/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/xcpcio/xcpcio" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2020-PRESENT <a href='https://github.com/Dup4' target='_blank'>Dup4</a> <a href='https://beian.miit.gov.cn/' target='_blank'>浙ICP备20011170号</a>",
    },
  },
});
