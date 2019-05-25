const NwjsWebpackPlugin = require('nwjs-webpack-plugin')
const merge = require('webpack-merge');
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = merge(require('./webpack.config.base'), {
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.css$/,
                // exclude: /splash/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css",

        })
    ],
    optimization: {
        splitChunks: {
            // include all types of chunks
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: 0,
                },
                jsons: {
                    test: /\.json$/,
                    priority: 1,
                },
                lodash: {
                    test: /lodash/,
                    name: 'lodash',
                    priority: 1,
                }
            }
        },
        concatenateModules: true,
        minimizer: [
            new TerserPlugin(),
            new OptimizeCSSAssetsPlugin({})
        ]
    }
})