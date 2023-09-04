const fs = require("fs");
const path = require("path");
const process = require("process");
const { app } = require('electron');
const readChunk = require('read-chunk');
const fileType = require('file-type');
const gunzip = require('gunzip-file')
const log = require('electron-log');
const tar = require('tar');
const unzip = require('unzipper');
const unrar = require("node-unrar-js");

isDev = process.env.ELECTRON_START_URL ? true : false;

const createSQliteFile = () => {
    const dbPath = process.env.ELECTRON_START_URL ? 
        path.join(__dirname, '..', '..', "boda-lite.sqlite.dev") : 
        path.join(app.getPath("userData"), "boda-lite.sqlite");

    
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, "");
    }
}

function findPython() {

  const py_path =  process.env.ELECTRON_START_URL ? 
    path.join(__dirname, '..', '..', "python", "bin", "python3.9") : 
    path.join(process.resourcesPath, "python", "bin", "python3.9");

  for (const p of possibilities) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  console.log("Could not find python3, checked", possibilities);
}



module.exports = { 
    findPython,
    createSQliteFile
 };