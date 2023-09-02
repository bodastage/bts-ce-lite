// node aggregate-node-deps.js | sort | uniq
//
//
// also remove -- yarn, webpack, electron, electron-builder, electron-webpack, electron-webpack-ts, electron-webpack-vue, electron-webpack-vue-ts, babel
//
//
//
//
//

const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const depList = [
'electron-log',
'umzug',
'glob',
'@electron/remote',
'@svgr/webpack',
'@types/node',
'@ungap/url-search-params',
'ajv',
'async',
'axios',
'bfj',
'buffer',
'case-sensitive-paths-webpack-plugin',
'csv-writer',
'csvtojson',
'date-fns',
'date-fns-jalali',
'dotenv',
'dotenv-expand',
'electron-is-dev',
'electron-log',
'electron-unrar-js',
'exceljs',
'file-loader',
'file-saver',
'file-type',
'firstline',
'fix-path',
'fs',
'fs-extra',
'fstream',
'gunzip-file',
'hex-and-rgba',
'hex-to-rgba',
'html-to-image',
'i',
'immutable',
'js-xlsx',
'line-reader',
'luxon',
'mini-css-extract-plugin',
'moment-hijri',
'moment-jalaali',
'node-sass',
'node-stream-zip',
'node-unrar-js',
'optimize-css-assets-webpack-plugin',
'path-browserify',
'pnp-webpack-plugin',
'popper',
'popper.js',
'reflect-metadata',
'replace-in-file',
'rw-stream',
'sequelize',
'shell-path',
'sqlite3',
'terser-webpack-plugin',
'unzipper',
'url-loader',
'url-search-params-polyfill',
'whatwg-fetch',
'winston-electron',
'workbox-webpack-plugin',
'xlsx',
'xmldom',
'xpath',
'fs.realpath',
];

const removeList = [
    'yarn',
    'babel'
];

depList.filter(v => removeList.indexOf(v)).forEach( dep => {
    console.log(`"${dep}/**/*",`);
    const nodePkgJson = require(path.join(__dirname, '..', 'node_modules', dep, 'package.json'));
    if(nodePkgJson.dependencies){
        Object.keys(nodePkgJson.dependencies).forEach( _dep => {
            console.log(`"${_dep}/**/*",`);

            const nodePkgJson3 = require(path.join(__dirname, '..', 'node_modules', _dep, 'package.json'));
            if(nodePkgJson3.dependencies){
                Object.keys(nodePkgJson3.dependencies).forEach( _dep2 => {
                    console.log(`"${_dep2}/**/*",`);
                });
            }

        });
    }
});

