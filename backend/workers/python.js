const workerHelper = require('./worker-helper');
const { workerData } = require('node:worker_threads');
// const utils = require('../libs/utils');
const cp = require("child_process");
const util = require("util");
const execFile = util.promisify(cp.execFile);
const path = require('path');
const process = require('process');


console.log("0000000000000000000000000HHHHH:", ' __dirname:', __dirname);

// const path_to_python =  process.env.ELECTRON_START_URL ? 
// path.join(__dirname, '..', '..', "python", "bin", "python3.9") : 
// path.join(process.resourcesPath, "python", "bin", "python3.9");

const path_to_python =  process.env.ELECTRON_START_URL ? 
path.join(__dirname, '..', '..', "python", "bin", "python3.9") :  //for dev
path.join(__dirname, '..', '..', '..', "python", "bin", "python3.9") ; //for prod

//const path_to_python =  path.join(__dirname, '..', '..', "python", "bin", "python3.9");

console.log('path_to_python:', path_to_python);


(async function() { 
    try{
        const result = await execFile(path_to_python, ["-c", workerData.code]);
        workerHelper.sendWorkerResults({
            status: 'success',
            message: result
        });
    }catch(e){
        console.log('error:', e);
        workerHelper.sendWorkerResults({
            status: 'error',
            message: e
        });
    }



})();