const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        'tfs-link.lambda': './src/tfs-link.lambda.js',
        'webex-link.lambda': './src/webex-link.lambda.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: "commonjs2"
    },
    target: "node",
    externals: [
        "aws-sdk"
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                        plugins: ['syntax-flow', 'transform-flow-strip-types']
                    }
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },
      plugins: [
      ]
};