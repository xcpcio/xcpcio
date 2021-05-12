import { defineConfig } from 'umi';
import __CONFIG__ from './config';
// import CaseSensitivePathsWabpackPlugin from 'case-sensitive-paths-webpack-plugin';

export default defineConfig({
  // chainWebpack(config, { webpack }) {
  //   // 检查路径大小写
  //   config
  //     .plugin('case-sensitive-paths-webpack-plugin')
  //     .use(CaseSensitivePathsWabpackPlugin, [{ debug: false }]);
  // },
  title: false,
  metas: __CONFIG__.metas,
  favicon: __CONFIG__.favicon,
  analytics: __CONFIG__.analytics,
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
  proxy: __CONFIG__.proxy,
  publicPath: __CONFIG__.publicPath,
});
