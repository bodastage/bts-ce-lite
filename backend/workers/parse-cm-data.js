const workerHelper = require('./worker-helper');
const { workerData } = require('node:worker_threads');

console.log('Running cm data parser....');
console.log('workerData:', workerData);
const telecomparser = require('boda-telecomparser');

try{
    //bulkcm
    if(workerData.format === 'BULKCM' && workerData.vendor === 'ERICSSON'){
        telecomparser.parse_bulkcm(workerData.inputFolder, workerData.outputFolder);
    }

    //huawei cfgmml
    if(workerData.format === 'CFGMML' && workerData.vendor === 'HUAWEI'){
        telecomparser.parse_huaweimml(workerData.inputFolder, workerData.outputFolder);
    }

    //huawei gexport mml
    if(workerData.format === 'GEXPORT_XML' && workerData.vendor === 'HUAWEI'){
        telecomparser.parse_huaweigexport(workerData.inputFolder, workerData.outputFolder);
    }

    //required to return results to main thread
    workerHelper.sendWorkerResults({
        status: 'success',
        message: 'Parsing completed successfully'
    });

}catch(e){
    workerHelper.sendWorkerResults({
        status: 'error',
        message: 'Parsing failed. ' + e.getMessage()
    });
}

console.log('terminating worker thread...');
process.exit(0);