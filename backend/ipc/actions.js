const { shell, app } = require('electron');
const db = require('../libs/db');

const ACTIONS = [

    //generic database query
    {
        name: 'db.query',
        handler: async (args) => {
            console.log('db.query:', args);
            const results = await db.runQuery(args);
            console.log('lllllllllllllllll:', results);
            return results;
        }
    },

    {
        name: 'db.migrate-up',
        handler: (args) => {
            console.log('db.migrate-up');
            return db.migrateUp();
            return true;
        }
    },
    {
        name: 'shell.open_path',
        handler: (args) => {
            console.log('shell.open_path');
            shell.openPath(args.path);
            return true;
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
        name: 'cm.parse-cm-data',
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
        handler: (args) => {
            console.log('utilities.convert-csv-to-excel', args);
            return true;
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
    }

];


module.exports = {
    ACTIONS
}
