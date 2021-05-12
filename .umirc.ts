import { defineConfig } from 'umi';
import CONFIG from './config';
// import CaseSensitivePathsWabpackPlugin from 'case-sensitive-paths-webpack-plugin';

export default defineConfig({
  // chainWebpack(config, { webpack }) {
  //   // 检查路径大小写
  //   config
  //     .plugin('case-sensitive-paths-webpack-plugin')
  //     .use(CaseSensitivePathsWabpackPlugin, [{ debug: false }]);
  // },
  title: false,
  metas: CONFIG.metas,
  favicon: CONFIG.favicon,
  analytics: CONFIG.analytics,
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
  proxy: CONFIG.proxy,
  publicPath: CONFIG.publicPath,
});
