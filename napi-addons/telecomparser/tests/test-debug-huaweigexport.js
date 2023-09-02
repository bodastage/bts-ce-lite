const telecomparser = require('../index-debug.js')
const path = require('path')

const inputFile3 = path.join(__dirname, '..', 'samples', 'huaweigexport');
const outputFile3 = path.join(__dirname, '..', 'output', 'huaweigexport');
telecomparser.parse_huaweigexport(inputFile3, outputFile3);