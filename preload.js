const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('btslite_api', {

    //Run generic database queries
    async dbQuery(query) {
        const result = await ipcRenderer.invoke('db.query', query)
        return result
    },

    //Run generic database queries
    async submitCode(args) {
        const result = await ipcRenderer.invoke('code.run', args)
        return result
    },

    //Run migrations
    async migrateUp() {
        const result = await ipcRenderer.invoke('db.migrate-up')
        return result
    },

    async createCategory(data) {
        const result = await ipcRenderer.invoke('reports.create-category', data);
        return result;
    },

    async updateCategory(data) {
        const result = await ipcRenderer.invoke('reports.update-category', data);
        return result;
    },

    async createReport(data) {
        const result = await ipcRenderer.invoke('reports.create-report', data);
        return result;
    },

    async updateReport(data) {
        const result = await ipcRenderer.invoke('reports.update-report', data);
        return result;
    },

    //launch file selection window
    async shellOpenPath(path) {
        const result = await ipcRenderer.invoke('shell.open-path', path);
        return result;
    },

    //add message to log
    async addToLog(message) {
        const result = await ipcRenderer.invoke('log.add', message);
        return result;
    },

    //parse cm data 
    async parseCmData(config) {
        const result = await ipcRenderer.invoke('cm.parse-cm-data', config);
        return result;
    },

    //parse cm data 
    async loadCmData(config) {
        const result = await ipcRenderer.invoke('cm.load-cm-data', config);
        return result;
    },

    //download reports 
    async reportsDownload(config) {
        const result = await ipcRenderer.invoke('reports.download', config);
        return result;
    },

    //show item in folder 
    async shellShowItemInFolder(path) {
        const result = await ipcRenderer.invoke('shell.show-item-in-folder', path);
        return result;
    },

    async getPath(path){
        const result = await ipcRenderer.invoke('app.get-path', path);
        return result;
    },

    async openPath(path){
        const result = await ipcRenderer.invoke('shell.open-path', path);
        return result;
    },

    async openDirectory(path){
        const result = await ipcRenderer.invoke('dialog.open-directory', path);
        return result;
    },

    async openLogFile(){
        const result = await ipcRenderer.invoke('log.open-file', path);
        return result;
    },

    async openLink(path){
        const result = await ipcRenderer.invoke('shell.open-link', path);
        return result;
    },
    async gisUploadFile(filename){
        const result = await ipcRenderer.invoke('gis.upload-file', filename);
        return result;
    },

    //Run baseline 
    async baselineRun(config){
        const result = await ipcRenderer.invoke('baseline.run', config);
        return result;
    },

    //Upload baseline 
    async baselineUpload(config){
        const result = await ipcRenderer.invoke('baseline.upload', config);
        return result;
    },

    //upload parameter reference 
    async uploadParameterReference(config){
        const result = await ipcRenderer.invoke('telecomlib.upload-parameter-reference', config);
        return result;
    },

    //auto generate parameter reference
    async authoGenerateParameterRef(config){
        const result = await ipcRenderer.invoke('telecomlib.auto-generate-parameter-reference', config);
        return result;

    },

    //convert csv to excel 
    async convertCsvToExcel(config){
        const result = await ipcRenderer.invoke('utilities.convert-csv-to-excel', config);
        return result;
    },

    //get data header 
    async kmlGetDataHeader(config){
        const result = await ipcRenderer.invoke('kml.get-data-header', config);
        return result;
    },

    //generate KML file 
    async kmlGenerateKMLFile(config){
        const result = await ipcRenderer.invoke('kml.generate-kml-file', config);
        return result;
    },

    //open log file 
    async logOpenLogFile(config){
            const result = await ipcRenderer.invoke('log.open-log-file', config);
            return result;
    },

    //open log file 
    async downloadBaseLineRef(config){
            const result = await ipcRenderer.invoke('baseline.download-ref', config);
            return result;
    }

})