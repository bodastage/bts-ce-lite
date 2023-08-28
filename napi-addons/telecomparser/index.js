// const telecomparser = require('./build/Release/telecomparser.node');
const telecomparser = require('bindings')('telecomparser');
console.log(telecomparser);
module.exports = telecomparser;