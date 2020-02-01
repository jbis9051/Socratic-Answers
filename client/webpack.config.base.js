const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackInjector = require('html-webpack-injector');

const CleanObsoleteChunks = require('webpack-clean-obsolete-chunks');

const {getEntries} = require('./webpack-util.js');

const jsentries = getEntries('./src/client/pages/', 'js');


const config = {
    entry: Object.assign(jsentries, {all_head: './client/pages/components/standard-head/standard-head.js'}),
    watch: true,
    output: {
        pathinfo: false,
        path: path.resolve(__dirname, './src/build'),
        filename: 'static/js/[name].[hash:8].js',
        chunkFilename: 'static/js/[name].chunk.[chunkhash:8].js',
        publicPath: '/',
    },
    resolve: {},
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            }
        ]
    },
    parallelism: 8,
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'initial',
                    minChunks: 2,
                },
                vendors: {
                    chunks: 'initial',
                    name: 'vendors',
                    test: /node_modules\//,
                    minChunks: 5,
                    priority: 10,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            path: path.resolve(__dirname, './src/build'),
            filename: 'static/css/[name].[hash:8].css',
            chunkFilename: 'static/css/[id].chunk.[hash:8].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        new CleanObsoleteChunks({
            verbose: true,
        }),
   //     new HtmlWebpackInjector(),
    ]
};

const pages = getEntries('./src/client/pages/', 'ejs');

for (const pathname in pages) {
    // Configured to generate the html file, define paths, etc.
    const conf = {
        path: path.resolve(__dirname, './src/build/static'),
        filename: `${pathname}.ejs`, // ejs output pathname
        template: '!!raw-loader!' + `${pages[pathname]}`, // Template path
        inject: true,
        //     favicon: path.resolve(__dirname, '../src/assets/favicon.ico'),
        chunks: [pathname],
        chunksSortMode: 'manual',
    };
    config.plugins.push(new HtmlWebpackPlugin(conf));
}

module.exports = config;
