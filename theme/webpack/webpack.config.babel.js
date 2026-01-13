const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const { getIfUtils, removeEmpty } = require('webpack-config-utils');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

const stats = {
    colors: true,
    hash: false,
    version: false,
    timings: false,
    assets: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: false,
    errorDetails: false,
    warnings: false,
    publicPath: false,
};

module.exports = (env, argv) => {

    const { ifProduction } = getIfUtils(argv.mode);

    return {
        mode: ifProduction('production', 'production'),
        entry: path.resolve(__dirname, '../scripts/app.js'),
        stats,
        output: {
            path: path.resolve(__dirname, '../../assets'),
            filename: 'app.js',
            chunkFilename: '[name].js?id=[chunkhash]',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: { sourceMap: ifProduction(false, false) }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: ifProduction(false, false)
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: { sourceMap: ifProduction(false, false) }
                        },
                        {
                            loader: 'import-glob-loader',
                            options: { sourceMap: ifProduction(false, false) }
                        },
                    ]
                },
                // {
                //     test: /\.(jpg|png|gif|svg)$/,
                //     loader: 'image-webpack-loader',
                //     enforce: 'pre'
                // },
                {
                    test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[name][hash].[ext]',
                        outputPath: '../images/generated/'
                    }
                },
            ]
        },
        optimization: {
            minimizer: [
                new DuplicatePackageCheckerPlugin(),
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: ifProduction(false, false)
                }),
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: true,
                        },
                    },
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: { discardComments: { removeAll: true } },
                    canPrint: true
                })
            ]
        },
        plugins: removeEmpty([
            new FriendlyErrorsWebpackPlugin(),
            new webpack.PrefetchPlugin(path.resolve(__dirname, '../styles/style.scss')),
            new MiniCssExtractPlugin({ filename: '/styles.css', chunkFilename: '[id].css' }),
        ])
    };
}; 