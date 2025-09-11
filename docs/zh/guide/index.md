# 开始使用

XCPCIO 是一个用于 ICPC/CCPC 竞赛编程比赛的综合平台。它为编程竞赛提供排名系统和排行榜可视化功能。

## 什么是 XCPCIO？

XCPCIO 提供：

- **比赛管理**：处理比赛元数据、队伍信息和提交数据
- **排名系统**：ICPC 风格的计分系统，包含罚时计算和实时更新
- **榜单托管**：专业的排行榜托管服务，支持同步功能
- **跨平台**：TypeScript 和 Python 库，确保数据处理的一致性

## 架构

这是一个 pnpm 单仓库，结构如下：

- **packages/libs/types**：整个项目的 TypeScript 类型定义
- **packages/libs/core**：核心业务逻辑、工具和比赛处理算法
- **packages/apps/board**：用于显示比赛排行榜的 Vue 3 前端应用
- **python/**：Python 库，提供与 TypeScript 包相同的类型定义和数据模型

## 快速开始

### 安装

```bash
# 安装 TypeScript 包
npm install @xcpcio/types @xcpcio/core

# 或者使用 Python 库
pip install xcpcio
```

### 基本用法

```typescript
import { calculateRanking } from "@xcpcio/core";
import { Contest, Submission, Team } from "@xcpcio/types";

// 定义比赛数据
const contest: Contest = {
  // 比赛配置
};

// 计算排名
const rankings = calculateRanking(contest);
```
