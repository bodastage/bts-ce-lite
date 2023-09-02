const fs = require("fs");
const path = require("path");
const process = require("process");
const { app } = require('electron');

const createSQliteFile = () => {
    const dbPath = process.env.ELECTRON_START_URL ? 
        path.join(__dirname, '..', '..', "db", "db.sqlite") : 
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