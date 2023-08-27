const path = require("path");

const config = {
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