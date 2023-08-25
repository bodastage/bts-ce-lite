const path = require('path');
const { shell, app, dialog } = require('electron');
const db = require('../libs/db');
const reports = require('../libs/reports');
const excel = require('../libs/excel');
const workerHelper = require('../workers/worker-helper');
  

const ACTIONS = [

    //generic database query
    {
        name: 'db.query',
        handler: async (args) => {
            console.log('db.query:', args);
            const results = await db.runQuery(args);
            return results;
        }
    },

    {
        name: 'db.migrate-up',
        handler: (args) => {
            console.log('db.migrate-up');
            return db.migrateUp();
        }
    },

    {
        name: 'reports.create-category',
        handler: (args) => {
            console.log('reports.create-category');
            return reports.createCategory(args);
        }
    },
    {
        name: 'reports.create-report',
        handler: (args) => {
            console.log('reports.create-report');
            return reports.createReport(args);
        }
    },
    {
        name: 'reports.update-report',
        handler: (args) => {
            console.log('reports.update-report');
            return reports.updateReport(args);
        }
    },
    {
        name: 'shell.open-path',
        handler: (args) => {
            console.log('shell.open-path', args);
            shell.openPath(args);
            return true;
        }
    },
    {
        name: 'shell.open-link',
        handler: (args) => {
            console.log('shell.open-link', args);
            shell.openExternal(args);
            return true;
        }
    },
    {
        name: 'dialog.open-directory',
        handler: (args) => {
            console.log('dialog.open-directory', args);
            var path = dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            return path;
        }
    },
    {
        name: 'log.add',
        handler: (args) => {
            console.log('log.add');
            return true;
        }
    },
    {
        name: 'log.open-file',
        handler: (args) => {
            console.log('log.add');
            return true;
        }
    },
    {
        name: 'cm.parse-cm-data',
        handler: async (args) => {
            console.log('cm.parse-cm-data', args);
                const worker_script = path.join(__dirname, '..', 'workers/parse-cm-data.js');
                result = await workerHelper.runWorkerScript(worker_script, args);

                return result;
            console.log('cm.parse-cm-data');
            return true;
        }
    },
    {
        name: 'cm.load-cm-data',
        handler: (args) => {
            //@TODO: use a worker thread to parse cm data
            console.log('cm.parse-cm-data');
            return true;
        }
    },
    {
        name: 'reports.download',
        handler: (args) => {
            console.log('reports.download', args);
            return true;
        }
    },
    {
        name: 'shell.show-item-in-folder',
        handler: (args) => {
            console.log('shell.show-item-in-folder', args);
            shell.showItemInFolder(args.path);
            return true;
        }
    },
    {
        name: 'app.get-path',
        handler: (args) => {
            console.log('app.get-path', args);
            app.getPath(args.path);
            return true;
        }
    },
    {
        name: 'gis.upload-file',
        handler: (args) => {
            console.log('gis.upload-file', args);
            return true;
        }

    },
    {
        name: 'baseline.run',
        handler: (args) => {
            console.log('baseline.run', args);
            return true;
        }

    },
    {
        name: 'baseline.upload',
        handler: (args) => {
            console.log('baseline.upload', args);
            return true;
        }
    },
    {
        name: 'telecomlib.upload-parameter-reference',
        handler: (args) => {
            console.log('telecomlib.upload-parameter-reference', args);
            return true;
        }
    },
    {
        name: 'telecomlib.auto-generate-parameter-reference',
        handler: (args) => {
            console.log('telecomlib.auto-generate-parameter-reference', args);
            return true;
        }
    },
    {
        name: 'utilities.convert-csv-to-excel',
        handler: async (args) => {
            console.log('utilities.convert-csv-to-excel', args);
                const worker_script = path.join(__dirname, '..', 'workers/csv-to-excel.js');
                result = await workerHelper.runWorkerScript(worker_script, {
                    ...args,
                    outputFolder: '/Users/ssebaggala/Development/BodastageGithub/bts-ce-lite' //args.outputFolder || app.getPath('downloads')
                });

                return result;
            
        }
    },
    {
        name: 'kml.get-data-header',
        handler: (args) => {
            console.log('kml.get-data-header', args);
            return true;
        }
    },{
        name: 'kml.generate-kml-file',
        handler: (args) => {
            console.log('kml.generate-kml-file', args);
            return true;
        }
    },
    {
        name: 'log.open-log-file',
        handler: (args) => {
            console.log('log.open-log-file', args);
            return true;
        }
    },
    {
        name: 'baseline.download-ref',
        handler: (args) => {
            console.log('baseline.download-ref', args);
            return true;
        }
    }

];


module.exports = {
    ACTIONS
}
