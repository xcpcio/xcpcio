# XCPCIO-board

![Build and Deploy](https://github.com/XCPCIO/XCPCIO-board/workflows/Build%20and%20Deploy/badge.svg)
[![License][license-image-mit]](https://mit-license.org/)
[![GitHub stars](https://img.shields.io/github/stars/XCPCIO/XCPCIO-board.svg?style=social&label=Stars)](https://github.com/XCPCIO/XCPCIO-board)

## Deploying

```bash
git clone https://github.com/XCPCIO/XCPCIO-board.git

# Installation dependencies
yarn install

# start http server
yarn start

# build the project
yarn build
```

## Configuration

配置文件在主目录下的 `config.ts` 。

```typescript
{
    title: 'Board - XCPCIO',
    publicPath: '/',
    // 数据源的前缀目录，该部分会在发送request请求时自动加在请求地址的前缀
    data_host: '/data/',
    metas: [
        {
            name: 'keywords',
            content: 'icpc, ccpc, board, rank, standings'
        },
        {
            name: 'description',
            content: 'XCPCIO-Board 主要收录 *CPC 系列竞赛的榜单。'
        },
    ],
    // 本地开发时数据源的代理地址
    proxy: {
        '/data': {
            target: 'https://board.xcpcio.com',
            changeOrigin: true,
        },
    },
};
```

## License

MIT.

[license-image-mit]: https://img.shields.io/badge/license-MIT-blue.svg?labelColor=333333