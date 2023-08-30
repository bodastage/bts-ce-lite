const fs = require("fs");
const path = require("path");
// const process = require("process");
const { process } = require('electron');

console.log('process:', process);
console.log('process.resourcesPath:', process.resourcesPath);


function findPython() {
  const possibilities = [
    // In packaged app
    path.join(process.resourcesPath, "python", "bin", "python3.9"),
    // In development
    path.join(__dirname, "python", "bin", "python3.9"),
  ];

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

module.exports = { findPython }