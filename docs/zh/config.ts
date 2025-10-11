import type { DefaultTheme } from "vitepress";
import { defineAdditionalConfig } from "vitepress";
import { version } from "../package.json";

const Guides: DefaultTheme.NavItemWithLink[] = [
  { text: "快速开始", link: "/zh/guide/" },
  { text: "榜单集成", link: "/zh/guide/board" },
  { text: "数据格式", link: "/zh/guide/data-format" },
  { text: "CCS 工具", link: "/zh/guide/ccs-utility" },
];

const Sponsors: DefaultTheme.NavItemWithLink[] = [
  { text: "赞助我们", link: "/zh/sponsor/" },
  { text: "杭师 Coder", link: "/zh/sponsor/hznu-coder" },
];

const Nav: DefaultTheme.NavItem[] = [
  {
    text: "指南",
    items: [
      {
        items: Guides,
      },
    ],
    activeMatch: "^/zh/guide/",
  },
  {
    text: "赛站",
    items: [
      {
        items: [
          { text: "ICPC", link: "/zh/site/icpc/" },
          { text: "CCPC", link: "/zh/site/ccpc/" },
          { text: "省赛", link: "/zh/site/provincial-contest/" },
        ],
      },
    ],
    activeMatch: "^/zh/site/icpc/",
  },
  {
    text: "赞助",
    items: [
      {
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

const ICPCs: DefaultTheme.SidebarItem[] = [
  { text: "一切的开始", link: "/zh/site/icpc/" },
  {
    text: "49th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/icpc/49th/" },
      { text: "武汉（邀请赛）", link: "/zh/site/icpc/49th/wuhan" },
      { text: "西安（邀请赛）", link: "/zh/site/icpc/49th/xian" },
      { text: "昆明（邀请赛）", link: "/zh/site/icpc/49th/kunming" },
    ],
  },
  {
    text: "48th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/icpc/48th/" },
    ],
  },
  {
    text: "47th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/icpc/47th/" },
      { text: "网络预选赛", link: "/zh/site/icpc/47th/online" },
      { text: "沈阳", link: "/zh/site/icpc/47th/shenyang" },
      { text: "西安", link: "/zh/site/icpc/47th/xian" },
      { text: "合肥", link: "/zh/site/icpc/47th/hefei" },
      { text: "济南", link: "/zh/site/icpc/47th/jinan" },
      { text: "杭州", link: "/zh/site/icpc/47th/hangzhou" },
      { text: "南京", link: "/zh/site/icpc/47th/nanjing" },
      { text: "香港", link: "/zh/site/icpc/47th/hongkong" },
      { text: "EC Final", link: "/zh/site/icpc/47th/ec" },
    ],
  },
  {
    text: "46th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/icpc/46th/" },
      { text: "网络预选赛", link: "/zh/site/icpc/46th/online" },
      { text: "济南站", link: "/zh/site/icpc/46th/jinan" },
      { text: "沈阳站", link: "/zh/site/icpc/46th/shenyang" },
      { text: "上海站", link: "/zh/site/icpc/46th/shanghai" },
      { text: "南京站", link: "/zh/site/icpc/46th/nanjing" },
      { text: "澳门站", link: "/zh/site/icpc/46th/macau" },
      { text: "昆明站", link: "/zh/site/icpc/46th/kunming" },
      { text: "EC Final", link: "/zh/site/icpc/46th/ec" },
    ],
  },
  {
    text: "2020",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/icpc/2020/" },
      { text: "牛客-小米", link: "/zh/site/icpc/2020/nowcoder-xiaomi" },
      { text: "上海", link: "/zh/site/icpc/2020/shanghai" },
      { text: "南京", link: "/zh/site/icpc/2020/nanjing" },
      { text: "济南", link: "/zh/site/icpc/2020/jinan" },
      { text: "昆明", link: "/zh/site/icpc/2020/kunming" },
      { text: "银川", link: "/zh/site/icpc/2020/yinchuan" },
      { text: "沈阳", link: "/zh/site/icpc/2020/shenyang" },
      { text: "澳门", link: "/zh/site/icpc/2020/macau" },
      { text: "EC Final", link: "/zh/site/icpc/2020/ec" },
      { text: "World Finals", link: "/zh/site/icpc/2020/world-finals" },
    ],
  },
  {
    text: "2019",
    collapsed: true,
    items: [
      { text: "World Finals", link: "/zh/site/icpc/2019/world-finals" },
      { text: "Hong Kong", link: "/zh/site/icpc/2019/hongkong" },
      { text: "EC Final", link: "/zh/site/icpc/2019/ec-final" },
    ],
  },
  {
    text: "2018",
    collapsed: true,
    items: [
      { text: "青岛", link: "/zh/site/icpc/2018/tingdao" },
      { text: "World Finals", link: "/zh/site/icpc/2018/world-finals" },
    ],
  },
  {
    text: "2017",
    collapsed: true,
    items: [
      { text: "World Finals", link: "/zh/site/icpc/2017/world-finals" },
    ],
  },
  {
    text: "2015",
    collapsed: true,
    items: [
      { text: "北京", link: "/zh/site/icpc/2015/beijing" },
      { text: "亚洲区决赛", link: "/zh/site/icpc/2015/ecfinal" },
    ],
  },
];

const CCPCs: DefaultTheme.SidebarItem[] = [
  { text: "一切的开始", link: "/zh/site/ccpc/" },
  {
    text: "9th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/ccpc/9th/" },
    ],
  },
  {
    text: "8th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/ccpc/8th/" },
      { text: "网络选拔赛", link: "/zh/site/ccpc/8th/preliminary-contest" },
      { text: "女生赛", link: "/zh/site/ccpc/8th/girl" },
      { text: "高职专场", link: "/zh/site/ccpc/8th/gaozhi" },
      { text: "桂林", link: "/zh/site/ccpc/8th/guilin" },
      { text: "威海", link: "/zh/site/ccpc/8th/weihai" },
      { text: "绵阳", link: "/zh/site/ccpc/8th/mianyang" },
      { text: "广州", link: "/zh/site/ccpc/8th/guangzhou" },
      { text: "总决赛", link: "/zh/site/ccpc/8th/final" },
    ],
  },
  {
    text: "7th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/ccpc/7th/" },
      { text: "网络选拔赛", link: "/zh/site/ccpc/7th/preliminary-contest" },
      { text: "女生赛", link: "/zh/site/ccpc/7th/girl" },
      { text: "桂林", link: "/zh/site/ccpc/7th/guilin" },
      { text: "广州", link: "/zh/site/ccpc/7th/guangzhou" },
      { text: "威海", link: "/zh/site/ccpc/7th/weihai" },
      { text: "哈尔滨", link: "/zh/site/ccpc/7th/harbin" },
    ],
  },
  {
    text: "6th",
    collapsed: true,
    items: [
      { text: "总览", link: "/zh/site/ccpc/6th/" },
      { text: "网络选拔赛", link: "/zh/site/ccpc/6th/preliminary-contest" },
      { text: "秦皇岛", link: "/zh/site/ccpc/6th/qinhuangdao" },
      { text: "威海", link: "/zh/site/ccpc/6th/weihai" },
      { text: "绵阳", link: "/zh/site/ccpc/6th/mianyang" },
      { text: "长春", link: "/zh/site/ccpc/6th/changchun" },
      { text: "总决赛", link: "/zh/site/ccpc/6th/final" },
      { text: "女生赛", link: "/zh/site/ccpc/6th/wfinal" },
    ],
  },
  {
    text: "5th",
    collapsed: true,
    items: [
      { text: "哈尔滨", link: "/zh/site/ccpc/5th/harbin" },
      { text: "总决赛", link: "/zh/site/ccpc/5th/final" },
    ],
  },
];

const ProvincialContests: DefaultTheme.SidebarItem[] = [
  { text: "一切的开始", link: "/zh/site/provincial-contest/" },
  {
    text: "2024",
    collapsed: true,
    items: [
      { text: "江苏省赛", link: "/zh/site/provincial-contest/2024/jiangsu" },
    ],
  },
  {
    text: "2023",
    collapsed: true,
    items: [
      { text: "四川省赛", link: "/zh/site/provincial-contest/2023/sccpc" },
    ],
  },
  {
    text: "2022",
    collapsed: true,
    items: [
      { text: "浙江省赛", link: "/zh/site/provincial-contest/2022/zjcpc" },
      { text: "湖北省赛", link: "/zh/site/provincial-contest/2022/hbcpc" },
    ],
  },
  {
    text: "2021",
    collapsed: true,
    items: [
      { text: "浙江省赛", link: "/zh/site/provincial-contest/2021/zjcpc" },
      { text: "江西省赛", link: "/zh/site/provincial-contest/2021/jiangxi" },
    ],
  },
  {
    text: "2020",
    collapsed: true,
    items: [
      { text: "浙江省赛", link: "/zh/site/provincial-contest/2020/zjcpc" },
      { text: "江西省赛", link: "/zh/site/provincial-contest/2020/jiangxicpc" },
      { text: "河南省赛", link: "/zh/site/provincial-contest/2020/henancpc" },
      { text: "江苏省赛", link: "/zh/site/provincial-contest/2020/jiangsucpc" },
    ],
  },
  {
    text: "2019",
    collapsed: true,
    items: [
      { text: "浙江省赛", link: "/zh/site/provincial-contest/2019/zjcpc" },
      { text: "江苏省赛", link: "/zh/site/provincial-contest/2019/jscpc" },
      { text: "四川省赛", link: "/zh/site/provincial-contest/2019/sccpc" },
      { text: "山东省赛", link: "/zh/site/provincial-contest/2019/sdcpc" },
      { text: "陕西省赛", link: "/zh/site/provincial-contest/2019/sxcpc" },
    ],
  },
  {
    text: "2018",
    collapsed: true,
    items: [
      { text: "浙江省赛", link: "/zh/site/provincial-contest/2018/zjcpc" },
    ],
  },
  {
    text: "2017",
    collapsed: true,
    items: [
      { text: "浙江省赛", link: "/zh/site/provincial-contest/2017/zjcpc" },
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
  "/zh/site/": [
    {
      text: "ICPC",
      items: ICPCs,
      collapsed: true,
    },
    {
      text: "CCPC",
      items: CCPCs,
      collapsed: true,
    },
    {
      text: "省赛",
      items: ProvincialContests,
      collapsed: true,
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
