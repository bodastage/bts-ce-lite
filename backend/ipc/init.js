const { start } = require(`./start.js`)
const { ACTIONS } = require(`./actions.js`);

// initialize & start IPC listener
start(ACTIONS);