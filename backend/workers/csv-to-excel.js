const excel = require('../libs/excel');
const workerHelper = require('./worker-helper');
const { workerData } = require('node:worker_threads');

console.log('running csv to excel ...................................');
console.log('workerData: ++++++++>', workerData);

const csvDirectory = workerData.csvDirectory;
const excelFormat = workerData.excelFormat;
const combined = workerData.combined;
const outputFolder = '';
console.log(excel);

(async function() { 

    console.log('async function ..............');
   
    let result = await excel.combineCSVsIntoExcel(csvDirectory, excelFormat, combined, outputFolder);
    console.log(result);
    
    
   workerHelper.sendWorkerResults(result);

 })()

