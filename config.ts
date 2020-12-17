export const config = {
    title: 'Board - XCPCIO',
    favicon: '/favicon.ico',
    publicPath: '/',
    data_host: '/data/',
    metas: [
        {
            name: 'keywords',
            content: 'icpc, ccpc, board, rank, standings',
        },
        {
            name: 'description',
            content: 'XCPCIO-Board 主要收录 *CPC 系列竞赛的榜单。',
        },
    ],
    proxy: {
        '/data': {
            target: 'http://127.0.0.1:8080',
            changeOrigin: true,
        },
    },
};

export default config;
