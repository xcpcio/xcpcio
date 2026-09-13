import type { DefaultTheme } from "vitepress";
import { defineAdditionalConfig } from "vitepress";
import packageJson from "../package.json" with { type: "json" };

const { version } = packageJson;

// Shared by the navbar and the sidebar. `NavItemWithLink["link"]` also accepts
// a `(payload: PageData) => string` resolver, which `SidebarItem["link"]` does
// not, so a plain string link is the common denominator of the two.
interface NavSidebarItem {
  text: string;
  link: string;
}

const Guides: NavSidebarItem[] = [
  { text: "Getting Started", link: "/guide/" },
  { text: "Leaderboard Integration", link: "/guide/board" },
  { text: "Data Format", link: "/guide/data-format" },
  { text: "Clics Utility", link: "/guide/clics-utility" },
];

const Sponsors: NavSidebarItem[] = [
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
  { text: "Board", link: "https://xcpcio.com/board/" },
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
