const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    target: 'node',
    resolve: { 
        fallback: { 
            "path": require.resolve("path-browserify"),
            "fs": require.resolve("fs")
        }
    },
    externals: ['pg', 'sqlite3', 'tedious', 'pg-hstore'],
}