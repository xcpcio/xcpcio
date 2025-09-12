import type { DefaultTheme } from "vitepress";
import { defineAdditionalConfig } from "vitepress";
import { version } from "../package.json";

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: "快速开始", link: "/zh/guide/" },
  { text: "榜单集成", link: "/zh/guide/board" },
  { text: "数据格式", link: "/zh/guide/data-format" },
];

const Sponsors: DefaultTheme.NavItemWithLink[] = [
  { text: "赞助我们", link: "/zh/sponsor/" },
];

const Nav: DefaultTheme.NavItem[] = [
  {
    text: "指南",
    items: [
      {
        text: "指南",
        items: Guides,
      },
    ],
    activeMatch: "^/zh/guide/",
  },
  {
    text: "赞助",
    items: [
      {
        text: "赞助",
        items: Sponsors,
      },
    ],
    activeMatch: "^/zh/sponsor/",
  },
  { text: "榜单", link: "https://board.xcpcio.com" },
  {
    text: `v${version}`,
    items: [
      {
        text: "更新日志",
        link: "https://github.com/xcpcio/xcpcio/releases",
      },
    ],
  },
];

const Sidebar: DefaultTheme.Sidebar = {
  "/zh/guide/": [
    {
      text: "指南",
      items: Guides,
    },
  ],
  "/zh/sponsor/": [
    {
      text: "赞助",
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
      text: "在 GitHub 上编辑此页面",
    },

    footer: {
      message: "基于 MIT 许可发布",
      copyright: "版权所有 © 2020-至今 <a href='https://github.com/Dup4' target='_blank'>Dup4</a> <a href='https://beian.miit.gov.cn/' target='_blank'>浙ICP备20011170号</a>",
    },
  },
});
