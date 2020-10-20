import { defineConfig } from 'umi';
import CONFIG from '../config';

export default defineConfig({
    title: CONFIG.title,
    nodeModulesTransform: {
        type: 'none',
    },
    hash: true,
    routes: [
        {
            path: '/',
            component: '@/pages/index',
            exact: false,
        },
    ],
    proxy: {
        '/data': {
            target: 'https://board.xcpcio.com',
            changeOrigin: true,
        },
    },
    publicPath: CONFIG.publicPath,
});
