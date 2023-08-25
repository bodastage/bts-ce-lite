const telecomparser = require('../index-debug.js')
const path = require('path')

const inputFile3 = path.join(__dirname, '..', 'samples', 'huaweimml', 'CFGMML1.txt');
const outputFile3 = path.join(__dirname, '..', 'output', 'huaweimml');
telecomparser.parse_huaweimml(inputFile3, outputFile3);