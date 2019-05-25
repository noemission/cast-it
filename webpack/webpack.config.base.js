const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const NwjsWebpackPlugin = require('nwjs-webpack-plugin')

module.exports = {
    entry: {
        main: path.resolve(__dirname, '..', 'src', 'index.js'),
        splash: path.resolve(__dirname, '..', 'src', 'splashScreen', 'splash.js')
    },
    target: 'node-webkit',
    externals: ['chai', 'sinon'],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '..', 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options:{
                        cacheDirectory: true
                    }
                }
            },
            // {
            //     test: /splash\.html/,
            //     use: [{
            //         loader: 'file-loader',
            //         options: {
            //             name: '[name].[ext]',
            //         }
            //     },
            //     {
            //         loader: 'extract-loader',
            //         options: {}
            //     }, 
            //     {
            //         loader: 'html-loader',
            //         options: {
            //             interpolate: true,
            //             attrs: ['img:src', 'link:href']
            //         }
            //     }]
            // },
            {
                test: /\.(woff(2)?|ttf|png|eot|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            }
        ]
    },
    node: {
        setImmediate: true
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            FLUENTFFMPEG_COV: false
        }),
        new HtmlWebpackPlugin({
            excludeChunks: ['splash'],
            template: path.resolve(__dirname, '..', 'index.html')
        }),
        new HtmlWebpackPlugin({
            chunks: ['splash'],
            filename: 'splash.html',
            template: `!!html-loader!${path.resolve(__dirname, '..', 'src/splashScreen/splash.html')}`
        }),
        new (class OnEnd {
            apply(compiler) {
                compiler.hooks.afterEmit.tap('OnEnd', () => {
                    console.time('copying-package')
                    fs.copyFileSync(
                        path.resolve(__dirname, '..', 'package.json'),
                        path.resolve(compiler.outputPath, 'package.json'),
                    )
                    console.timeEnd('copying-package')

                    // require('fs').writeFileSync(compiler.outputPath,JSON.stringify(require('../package.json')))
                })
            }
        })
    ]
};