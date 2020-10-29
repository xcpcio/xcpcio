import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

config.plugin('case-sensitive-paths').use(CaseSensitivePathsPlugin, [
    {
        debug: true,
    },
]);
