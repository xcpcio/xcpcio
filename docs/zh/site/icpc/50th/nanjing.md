---
aside: false
description: 「华为杯」第 50 届 ICPC 国际大学生程序设计竞赛亚洲区域赛南京站于 2025 年 11 月 8 - 9 日在南京航空航天大学顺利举行！
head:
  - - meta
    - property: og:image
      content: https://upload-file.xcpcio.com/icpc/50th/nanjing_og.png
  - - meta
    - property: og:image:width
      content: "1200"
  - - meta
    - property: og:image:height
      content: "630"
  - - meta
    - property: og:image:type
      content: image/png
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:image
      content: https://upload-file.xcpcio.com/icpc/50th/nanjing_og.png
---

# 「华为杯」第 50 届 ICPC 国际大学生程序设计竞赛亚洲区域赛（南京）

<div class="flex justify-center mt-6">
  <img
    src="https://upload-file.xcpcio.com/icpc/50th/nanjing_og.png"
    alt="「华为杯」第 50 届 ICPC 国际大学生程序设计竞赛亚洲区域赛（南京）"
    width="1200" height="630"
    class="rounded-lg"
  />
</div>

<ul class="list-none space-y-2">
  <li v-for="link in links" :key="link.url">
    <a :href="link.url" target="_blank" rel="nofollow noopener" class="inline-flex items-center gap-2 hover:underline">
      <span :class="[link.icon, link.color]"></span>
      <span>{{ link.title }}</span>
    </a>
  </li>
</ul>

<script setup>
const links = [
  { url: 'https://docs.qq.com/pdf/DUE9oVWhRV0ZjUGxR', title: '参赛手册', icon: 'i-carbon-document', color: 'text-blue-500' },
  { url: 'https://docs.qq.com/sheet/DUGhDb0xKdFVObXh4', title: '参赛名单', icon: 'i-carbon-user-multiple', color: 'text-green-500' },
  { url: 'https://live.photoplus.cn/live/pc/9468297/#/live', title: '图片直播', icon: 'i-carbon-camera', color: 'text-purple-500' },
  { url: 'https://zhuanlan.zhihu.com/p/1970594490793301261', title: '裁判长发言', icon: 'i-streamline-legal-justice-hammer-hammer-work-legal-mallet-office-company-gavel-justice-judge-arbitration-court', color: 'text-orange-500' },
  { url: 'https://zhuanlan.zhihu.com/p/1971315564061360261', title: '选手代表发言', icon: 'i-carbon-user-speaker', color: 'text-cyan-500' },
  { url: 'https://www.zhihu.com/question/1963739083760199356/answer/1971346223316328630', title: '技术组小作文', icon: 'i-carbon-code', color: 'text-red-500' },
]
</script>
