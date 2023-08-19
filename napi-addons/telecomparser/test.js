const telecomparser = require('./index.js')
const path = require('path')

const inputFile = path.join(__dirname, 'samples', 'bulkcm.xml');
const outputFile = path.join(__dirname, 'output');

telecomparser.parse_bulkcm(inputFile, outputFile);