const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
    mode: 'production',
    entry: {
        main: "./main.js",
        preload: "./preload.js",
        init: "./backend/ipc/init.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    optimization: {
        minimizer: [
          new TerserPlugin({
            parallel: true,
          }),
        ],
    },    
    plugins: [
        new BundleAnalyzerPlugin()
    ],
    module: {
        // rules: [{ 
        //     test: /\.js$/, 
        //     exclude: /node_modules/, 
        //     use: "babel-loader" }]
    },
    stats: {
        colors: true
    },
    target: "electron-main",
    devtool: "source-map"
};

module.exports = config;