import { defineConfig } from 'umi';
import CONFIG from '../config';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default defineConfig({
    // chainWebpack(config, { webpack }) {
    //     config
    //         .plugin('html')
    //         .use(HtmlWebpackPlugin, [{
    //             template: '@/pages/document.ejs',
    //             filename: 'index.html',
    //             minify: {
    //                 collapseWhitespace: true,
    //                 removeComments: true,
    //                 removeRedundantAttributes: true,
    //                 removeScriptTypeAttributes: true,
    //                 removeStyleLinkTypeAttributes: true,
    //                 useShortDoctype: true,
    //             },
    //         }]);
    // },
    title: CONFIG.title,
    nodeModulesTransform: {
        type: 'none',
    },
    hash: true,
    routes: [
        {
            path: '/',
            component: '@/pages/index',
            exact: true,
        },
        {
            path: '/',
            component: '@/pages/board/board',
            exact: false,
        },
    ],
    proxy: {
        '/data': {
            // target: 'https://board.xcpcio.com',
            target: 'http://data.top',
            changeOrigin: true,
        },
    },
    publicPath: CONFIG.publicPath,
});
