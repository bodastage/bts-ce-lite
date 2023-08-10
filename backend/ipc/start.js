// initialize & start IPC listener

const { ipcMain } = require('electron')

// recieve ipc channel names & initialize them
const start = async (actions = []) => {
    // start event listeners for each route
    actions.forEach(action => (
        ipcMain.handle(`${action.name}`, async (event, arg) => {
            // Test args here:
            // console.log('arg here', arg) // prints arg
            const result = await action.handler(arg)
            // event.returnValue -> synchronous reply
            // event.reply -> async reply
            return event.reply = result
        })
    ))
}


module.exports = {
    start
}