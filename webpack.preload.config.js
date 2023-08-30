const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
    mode: 'production',
    entry: {
        preload: "./preload.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        rules: [{ test: /\.js$/, exclude: /node_modules/, use: "babel-loader" }]
    },
    stats: {
        colors: true
    },
    target: "electron-preload",
    devtool: "source-map"
};

module.exports = config;