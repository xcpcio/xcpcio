export const config = {
    title: 'Board - XCPCIO',
    publicPath: '/',
    data_host: '/data/',
    proxy: {
        '/data': {
            target: 'http://data.top',
            changeOrigin: true,
        },
    },
};

export default config;
