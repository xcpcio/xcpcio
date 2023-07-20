# xcpcio/apps/board

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

[MIT](../../../LICENSE) License © 2023 [XCPCIO][xcpcio]

[xcpcio]: https://github.com/XCPCIO
