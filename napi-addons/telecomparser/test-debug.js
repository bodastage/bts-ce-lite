const telecomparser = require('./index-debug.js')
const path = require('path')

console.log(telecomparser);

// const inputFile = path.join(__dirname, 'samples', 'bulkcm.xml');
// const outputFile = path.join(__dirname, 'output', 'sample1');
// telecomparser.parse_bulkcm(inputFile, outputFile);

// const inputFile2 = path.join(__dirname, 'samples', 'bulkcm2.xml');
// const outputFile2 = path.join(__dirname, 'output', 'sample2');
// telecomparser.parse_bulkcm(inputFile2, outputFile2);

// const inputFile3 = path.join(__dirname, 'samples', 'bulkcm', 'bulkcm3.xml');
// const outputFile3 = path.join(__dirname, 'output', 'bulkcm', 'sample3');
// telecomparser.parse_bulkcm(inputFile3, outputFile3);

const inputFile3 = path.join(__dirname, 'samples', 'gexport');
const outputFile3 = path.join(__dirname, 'output', 'gexport');
telecomparser.parse_huaweigexport(inputFile3, outputFile3);