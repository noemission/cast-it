const NwjsWebpackPlugin = require('nwjs-webpack-plugin')
const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(require('./webpack.config.base'), {
    mode: 'development',
    watch: true,
    devtool: 'inline-source-map',
    plugins: [
        new NwjsWebpackPlugin({
            command: 'nw'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader", }
                ]
            },
        ]
    }

})