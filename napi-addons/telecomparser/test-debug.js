const telecomparser = require('./index-debug.js')
const path = require('path')

// const inputFile = path.join(__dirname, 'samples', 'bulkcm.xml');
// const outputFile = path.join(__dirname, 'output', 'sample1');
// telecomparser.parse_bulkcm(inputFile, outputFile);

// const inputFile2 = path.join(__dirname, 'samples', 'bulkcm2.xml');
// const outputFile2 = path.join(__dirname, 'output', 'sample2');
// telecomparser.parse_bulkcm(inputFile2, outputFile2);

const inputFile3 = path.join(__dirname, 'samples', 'bulkcm3.xml');
const outputFile3 = path.join(__dirname, 'output', 'sample3');
telecomparser.parse_bulkcm(inputFile3, outputFile3);