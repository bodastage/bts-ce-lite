const {
    Worker, isMainThread, parentPort, workerData,
} = require('node:worker_threads');


/**
 * setup workder to run some work. This is run in the main thread
 * 
 * 
 * @param {} script 
 * @param {*} workerData 
 * @returns 
 */
function runWorkerScript(script_file, workerData) {
    console.log('runWorkerScript:  workerData=', workerData );
    return new Promise((resolve, reject) => {
        const worker = new Worker(script_file, {
            workerData: workerData,
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
};



/**
 * Return worker results to main thread
 * @param {'*'} results 
 */
function sendWorkerResults(results) {
    parentPort.postMessage(results);
    //worker.terminate();
    process.exit();
}


module.exports = {
    runWorkerScript,
    sendWorkerResults
}